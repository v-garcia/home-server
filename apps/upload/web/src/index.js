import tus from "tus-js-client";

import styles from "./index.module.css";

const DEBUG = false;

const $ = e => document.querySelector(e);
const $$ = e => document.querySelectorAll(e);

const uploads = {};

function updateModel(uploadId, propertyName, val) {
  let u = uploadId in uploads ? uploads[uploadId] : { id: uploadId };

  u = { ...u, [propertyName]: val };
  uploads[uploadId] = u;

  DEBUG && console.log(JSON.parse(JSON.stringify(uploads)));

  setTimeout(() => refreshView(u), 0);

  return u[propertyName];
}

// helpers
function uploadStatus(model) {
  if (model.success) {
    return "success";
  }
  if (model.error) {
    return "error";
  }
  if (model.paused) {
    return "paused";
  }

  return "loading";
}

// events

function handleUploadPause(id) {
  const model = uploads[id];
  const uploadState = uploadStatus(model);

  if (uploadState == "success") {
    return;
  }

  const paused = uploadState == "paused";
  if (uploadState == "paused") {
    model.tus.start();
    updateModel(id, "paused", false);
  } else if (uploadState == "error") {
    model.tus.start();
    updateModel(id, "error", false);
  } else {
    model.tus.abort();
    updateModel(id, "paused", true);
  }
}

function refreshView(model) {
  let { $e } = model;

  // Init
  if (!$e) {
    let $frag = $("#upload-item").content.cloneNode(true);

    $frag.querySelector(".upload-item__title").textContent =
      model.tus.options.metadata.filename;

    $frag
      .querySelector(".upload-item__start")
      .addEventListener("click", handleUploadPause.bind(null, model.id));

    $e = [].slice.call($frag.childNodes, 0)[0];

    $("#uploads-list").appendChild($frag);

    model.$e = $e;
  }

  // Updates
  const status = uploadStatus(model);

  // Progress
  $e.querySelector(".upload-item__progress").value = isNaN(
    model.progressPercentage
  )
    ? 0
    : Number(model.progressPercentage);

  $e.querySelector(
    ".upload-item__label"
  ).innerText = `${model.progressPercentage}%`;

  // Status

  const [icon, rotating] = {
    success: ["✅"],
    error: ["❌"],
    loading: ["⏳", true],
    paused: [""]
  }[status];

  $e.querySelector(".upload-item__status").innerText = icon;
  $e.querySelector(".upload-item__status").classList.toggle(
    styles.rotate,
    rotating
  );

  // Start button
  const [btnText, btnHidden] = {
    success: ["", true],
    error: ["🔄", false],
    loading: ["⏸", false],
    paused: ["▶", false]
  }[status];
  $e.querySelector(".upload-item__start").innerHTML = btnText;
  $e.querySelector(".upload-item__start").classList.toggle(
    styles.hidden,
    btnHidden
  );
  return $e;
}

function startUpload(file, destination) {
  if (!file) {
    return;
  }

  const id = createUUID();
  const options = {
    endpoint: "/files/",
    resume: true,
    chunkSize: 10 * 1024 * 1024,
    retryDelays: [0, 1000, 3000, 5000],
    uploadDataDuringCreation: true,
    metadata: {
      filename: file.name,
      filetype: file.type,
      destination: destination
    },
    onError: function(error) {
      if (error.originalRequest) {
        if (
          window.confirm("Failed because: " + error + "\nDo you want to retry?")
        ) {
          upload.start();
          return;
        }
      } else {
        window.alert("Failed because: " + error);
      }

      updateModel(id, "error", error);
    },
    onProgress: function(bytesUploaded, bytesTotal) {
      const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      console.info(bytesUploaded, bytesTotal, percentage + "%");
      updateModel(id, "progressPercentage", percentage);
    },
    onSuccess: function() {
      const msg =
        "Uploaded " + upload.file.name + " (" + upload.file.size + " bytes)";
      console.info(msg);

      updateModel(id, "success", true);
    }
  };

  const upload = new tus.Upload(file, options);

  if (!upload) {
    alert("Fucking error");
    return;
  }
  upload.start();

  updateModel(id, "tus", upload);

  return upload;
}

$('[name="public_upload"]').addEventListener("change", e => {
  console.log("new file upload");
  const $target = e.target;
  const target = $('[name="upload_target"]').value;

  for (const f of $target.files) {
    startUpload(f, target);
  }

  $target.value = "";
});

function createUUID() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
