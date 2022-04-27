const JamfApiClient = require('jamf')

class Computer {

    constructor(blob) {
        this.blob = blob
        this.name = blob.general.name
        this.site = blob.general.site.name
        this.potd = blob.extension_attributes.find(element => element.id == 1430).value
        this.installedSoftware = blob.software.applications
        this.fileVaultUsers = blob.hardware.filevault2_users
        this.model = blob.hardware.model
        this.printers = blob.hardware.mapped_printers
        this.processor = blob.hardware.processor_type
        this.storage = blob.hardware.storage[0].model
        this.ram = blob.hardware.total_ram_mb
        this.osVersion = blob.hardware.os_version
        this.lastCheckIn = blob.general.last_contact_time
        this.buildDate = blob.general.initial_entry_date

    }
        isFileVaulted() {
            if (this.fileVaultUsers.length > 0) return true
            else return false
        }
        updateInfo(infoFields) {
           infoFields[0].innerHTML = this.model
           infoFields[1].innerHTML = this.processor
           infoFields[2].innerHTML = this.storage
           infoFields[3].innerHTML = this.ram
           infoFields[4].innerHTML = this.site
           infoFields[5].innerHTML = this.isFileVaulted()
        //    let select = document.querySelector('#software')
        //    this.installedSoftware.forEach(software => {
        //        let el = document.createElement("option")
        //        el.textContent = software.name
        //        el.value = software.name
        //        select.appendChild(el)
        //    })
        }
}


const gifCount = 18

let catchPhrases = ['Fetching...',
                    'Cooking up something real nice...',
                    'Learning something new...',
                    'Computer, return admin password for-',
                    'Calling it in...',
                    'Pulling it up...',
                    'Asking my attorney...',
                    'Solving the riddle...',
                    'Getting elected...',
                    'Beating the level...',
                    'Saving the day...',
                    'Uhh.....',
                    'Typing it out for you...',
                    'Judging...',
                    'Waiting for JAMF...',
                    'Constructing additional pylons...',
                    'Trying to fetch...',
                    'Using the force...']


let history = []

//HTML SELECTORS
const submitButton = document.querySelector('#submit')
const potdField = document.querySelector('#potdField')
const serialField = document.querySelector('#serial')
const usernameField = document.querySelector('#username')
const passwordField = document.querySelector('#password')
const checkInField = document.querySelector('#lastCheckIn')
const siteCodeField = document.querySelector('#siteCode')
const loadingGIF = document.querySelector('#loadGIF')
const moreInfoPane = document.querySelector('#moreInfo')
const main = document.querySelector('main')
//Button Selectors
const copyButton = document.querySelector('#copyToClipboard')
const goBackButton = document.querySelector('#back')
const showMoreInfo = document.querySelector('#showMoreInfo')
//more Info Fields
let infoFields = []
let infoIDs = ['model','processor','storage','ram','siteInfo','fileVaulted','software']
infoIDs.forEach(info => {
    console.log(`#${info}`)
    infoFields.push(document.querySelector(`#${info}`))
})

//UI Switching
const toggleMoreInfo = function(toggle) {
    if (toggle) {
        moreInfoPane.classList.remove('hidden')
        main.classList.add('hidden')
    }
    else {
        moreInfoPane.classList.add('hidden')
        main.classList.remove('hidden')
    }
}

//GIF handling
const showGIF = function (toggle) {
    if (toggle) {
        let rand = Math.ceil(Math.random() * gifCount)
        loadingGIF.src = `gif/${rand}.gif`
        loadingGIF.classList.remove('hidden')
        potdField.innerHTML = catchPhrases[rand - 1]
    }
    else {
        loadingGIF.classList.add('hidden')
    }
}

// Fetch Button
const handlePress = function () {
        let serial = serialField.value
        username = usernameField.value
        password = passwordField.value
        if (username == '' || password == '') {
             alert('Try again: 3ID and/or password cannot be blank. \nTip: Daniel Craig is James Bond.')
             return 0
        }
        else if (serial == '') {
            alert('Please provide a serial number or host name.')
        }
        getPotd(serial,username,password)
}

//Other Buttons and Field Events
goBackButton.addEventListener('click', () => {
    toggleMoreInfo(false)
})
showMoreInfo.addEventListener('click', () => {
    toggleMoreInfo(true)
})
submitButton.addEventListener('click', handlePress)
serialField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        console.log('Pressed Enter?!')
        handlePress()
    }
})
copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(potdField.innerHTML)
    alert('Copied!')
})

let current = {}

function getPotd(serial,username,password) {
    //do UI stuff
    copyButton.classList.add('hidden')
    siteCodeField.innerHTML = ``
    checkInField.innerHTML = ``
    potdField.style.fontSize = '1em'
    showGIF(true)
    let config = {
        user: username,
        password: password,
        jamfUrl: 'https://jamf-api.disney.com:8443',
        format: 'json'
    }
    let jamf = new JamfApiClient(config)
    
    jamf.get(`/computers/name/${serial}`, function (err,res) {

        console.log(res)
        //Error handling - needs to catch more errors!
        if (err) {
            if (err == 404) {
                alert(`${serial} not found!`)
                potdField.innerHTML = '...'
            }
        else if (res == null) {
                alert('Unauthorized! Check 3ID and password.')
                potdField.innerHTML = '...'
            }
        //No errors - go fetch!
        }else {
            potdField.style.fontSize = '3em'

            current = new Computer(res.computer)
            current.updateInfo(infoFields)
            history.push(current)

            siteCodeField.innerHTML = `Site: ${current.site}`
            checkInField.innerHTML = `as of ${current.lastCheckIn}`
            potdField.innerHTML = current.potd
            copyButton.classList.remove('hidden')
            showGIF(false)
            
        }
    })
}

