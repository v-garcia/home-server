import { $, $$, downloadBlob } from './dom-utils'
import { addSlash, getFormattedDate, pick } from './util'
import pdfBase from '../certificate.pdf'
import { generatePdf } from './pdf-util'
import { fakeHomeAddress } from './fake-info'
import dateSub from 'date-fns/sub'
import dateFormat from 'date-fns/format'

const conditions = {
  '#field-firstname': {
    length: 1,
  },
  '#field-lastname': {
    length: 1,
  },
  '#field-birthday': {
    pattern: /^([0][1-9]|[1-2][0-9]|30|31)\/([0][1-9]|10|11|12)\/(19[0-9][0-9]|20[0-1][0-9]|2020)/g,
  },
  '#field-placeofbirth': {
    length: 1,
  },
  '#field-address': {
    length: 1,
  },
  '#field-city': {
    length: 1,
  },
  '#field-zipcode': {
    pattern: /\d{5}/g,
  },
  '#field-datesortie': {
    pattern: /\d{4}-\d{2}-\d{2}/g,
  },
  '#field-heuresortie': {
    pattern: /\d{2}:\d{2}/g,
  },
}

function validateAriaFields () {
  return Object.keys(conditions)
    .map((field) => {
      const fieldData = conditions[field]
      const pattern = fieldData.pattern
      const length = fieldData.length
      const isInvalidPattern = pattern && !$(field).value.match(pattern)
      const isInvalidLength = length && !$(field).value.length

      const isInvalid = !!(isInvalidPattern || isInvalidLength)

      $(field).setAttribute('aria-invalid', isInvalid)
      if (isInvalid) {
        $(field).focus()
      }
      return isInvalid
    })
    .includes(true)
}

function setLeavingFields () {
  const leavingDate = dateSub(new Date(), { minutes: 20 })

  const leavingTime = dateFormat(leavingDate, 'HH:mm')
  document.getElementById('field-creationHour').value = leavingTime
  document.getElementById('field-datesortie').valueAsDate = leavingDate
  document.getElementById('field-heuresortie').value = leavingTime
}

function setHomeAddress (address) {
  for (const [key, value] of Object.entries(address)) {
    document.getElementById(`field-${key}`).value = value
  }
}

export function setReleaseDateTime (releaseDateInput) {
  const loadedDate = new Date()
  releaseDateInput.value = getFormattedDate(loadedDate)
}

export function getProfile (formInputs) {
  const fields = {}
  for (const field of formInputs) {
    let value = field.value
    if (field.id === 'field-datesortie') {
      const dateSortie = field.value.split('-')
      value = `${dateSortie[2]}/${dateSortie[1]}/${dateSortie[0]}`
    }
    fields[field.id.substring('field-'.length)] = value
  }
  return fields
}

export function getReasons (reasonInputs) {
  const reasons = reasonInputs
    .filter((input) => input.checked)
    .map((input) => input.value)
    .join(', ')
  return reasons
}

function getCurrentPosition () {
  if (navigator.geolocation) {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        })
      })
    })
  } else {
    alert('Déso, impossible localiser ta position')
    return Promise.reject(Error('navigator.geolocation unavailable'))
  }
}

export function prepareInputs (
  formInputs,
  reasonInputs,
  reasonFieldset,
  reasonAlert,
  snackbar,
) {
  formInputs.forEach((input) => {
    const exempleElt = input.parentNode.parentNode.querySelector('.exemple')
    const validitySpan = input.parentNode.parentNode.querySelector('.validity')
    if (input.placeholder && exempleElt) {
      input.addEventListener('input', (event) => {
        if (input.value) {
          exempleElt.innerHTML = 'ex.&nbsp;: ' + input.placeholder
          validitySpan.removeAttribute('hidden')
        } else {
          exempleElt.innerHTML = ''
        }
      })
    }
  })

  $('#field-birthday').addEventListener('keyup', function (event) {
    event.preventDefault()
    const input = event.target
    const key = event.keyCode || event.charCode
    if (key !== 8 && key !== 46) {
      input.value = addSlash(input.value)
    }
  })

  $$([
    '[name="firstname"],[name="lastname"],[name="birthday"],[name="placeofbirth"],[name="address"],[name="city"],[name="zipcode"]',
  ]).forEach((item) => {
    item.addEventListener('input', (event) => {
      const data = getProfile(formInputs)
      console.log(data)
      const toSave = pick(data, [
        'firstname',
        'lastname',
        'birthday',
        'placeofbirth',
        'city',
        'address',
        'zipcode',
      ])
      localStorage.setItem('form-data', JSON.stringify(toSave))
    })
  })

  reasonInputs.forEach((radioInput) => {
    radioInput.addEventListener('change', function (event) {
      const isInError = reasonInputs.every((input) => !input.checked)
      reasonFieldset.classList.toggle('fieldset-error', isInError)
      reasonAlert.classList.toggle('hidden', !isInError)
    })
  })

  $('#fake-field-btn').addEventListener('click', async (event) => {
    const setLoading = (loading) =>
      document
        .getElementById('fake-field-btn')
        .classList[loading ? 'add' : 'remove']('loading')
    setLoading(true)

    try {
      const position = await getCurrentPosition()
      const fakeAddress = await fakeHomeAddress(position)

      setLeavingFields()
      setHomeAddress(fakeAddress)
      setLoading(false)
    } catch (e) {
      setLoading(false)
      throw e
    }
  })

  $('#generate-btn').addEventListener('click', async (event) => {
    event.preventDefault()

    const reasons = getReasons(reasonInputs)
    if (!reasons) {
      reasonFieldset.classList.add('fieldset-error')
      reasonAlert.classList.remove('hidden')
      reasonFieldset.scrollIntoView && reasonFieldset.scrollIntoView()
      return
    }

    const invalid = validateAriaFields()
    if (invalid) {
      return
    }

    const pdfBlob = await generatePdf(getProfile(formInputs), reasons, pdfBase)

    const creationInstant = new Date()
    const creationDate = creationInstant.toLocaleDateString('fr-CA')
    const creationHour = creationInstant
      .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      .replace(':', '-')

    downloadBlob(pdfBlob, `attestation-${creationDate}_${creationHour}.pdf`)

    snackbar.classList.remove('d-none')
    setTimeout(() => snackbar.classList.add('show'), 100)

    setTimeout(function () {
      snackbar.classList.remove('show')
      setTimeout(() => snackbar.classList.add('d-none'), 500)
    }, 6000)
  })
}

export function prepareForm () {
  const formInputs = $$('#form-profile input')
  const snackbar = $('#snackbar')
  const reasonInputs = [...$$('input[name="field-reason"]')]
  const reasonFieldset = $('#reason-fieldset')
  const reasonAlert = reasonFieldset.querySelector('.msg-alert')
  setLeavingFields()
  prepareInputs(formInputs, reasonInputs, reasonFieldset, reasonAlert, snackbar)
}
