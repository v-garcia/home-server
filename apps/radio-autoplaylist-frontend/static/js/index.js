function getSpotifyIdFromStr(str) {
  return /[a-z0-9]{22}/i.exec(str)?.pop();
}

const trackIdToFrameId = (id) => `t-spotify-iframe-id-${id}`;
const spotifyIdToFrameUrl = (id) =>
  `https://open.spotify.com/embed/track/${id}`;
const getElementTrackId = (el) => el.id.split("-").pop();

function createSpotifySongFrame(trackId, spotifyId) {
  let frame = document.createElement("iframe");
  frame.id = trackIdToFrameId(trackId);
  frame.src = spotifyIdToFrameUrl(spotifyId);
  frame.width = "100%";
  frame.height = "100px";
  frame.setAttribute("allowtransparency", true);
  frame.setAttribute("allow", "encrypted-media");
  frame.setAttribute("frameborder", "0");
  return frame;
}

window.addEventListener("DOMContentLoaded", (event) => {
  // Display spotify frame next to track
  document.querySelectorAll('[name^="t-new-spotify-id-"]').forEach((e) => {
    e.addEventListener("input", (e) => {
      let trackId = getElementTrackId(e.target);
      let spotifyId = getSpotifyIdFromStr(e.target.value);
      let spotifyIframe = document.getElementById(trackIdToFrameId(trackId));

      if (spotifyId) {
        e.target.value = spotifyId;

        if (spotifyIframe) {
          spotifyId.src = spotifyIdToFrameUrl(spotifyId);
        } else {
          spotifyIframe = createSpotifySongFrame(trackId, spotifyId);
          document
            .getElementById(`t-spotify-iframe-ctn-id-${trackId}`)
            .appendChild(spotifyIframe);
        }
      } else {
        spotifyIframe?.remove();
      }
    });
  });

  // Handle paste from clipboard command
  document.querySelectorAll(".paste-from-clipboard").forEach((e) => {
    e.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      let trackId = getElementTrackId(e.target);
      let clipText = await navigator.clipboard.readText();
      let target = document.getElementById(`t-new-spotify-id-${trackId}`);
      target.value = clipText;
      target.dispatchEvent(new Event("input"));
    });
  });

  // Handle copy to clipboard commands
  new ClipboardJS(".clipboard-please");

  // Set up lightbox
  let lightbox = GLightbox({ selector: ".glightbox" });
});
