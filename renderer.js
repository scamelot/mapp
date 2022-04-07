const JamfApiClient = require('jamf')

const submitButton = document.querySelector('#submit')
const potdField = document.querySelector('#potdField')
const serialField = document.querySelector('#serial')
const usernameField = document.querySelector('#username')
const passwordField = document.querySelector('#password')
const checkInField = document.querySelector('#lastCheckIn')
const siteCodeField = document.querySelector('#siteCode')
const loadingGIF = document.querySelector('#loadGIF')

const copyButton = document.querySelector('#copyToClipboard')

const showGIF = function (toggle) {
    if (toggle) {
        let rand = Math.ceil(Math.random() * 8)
        loadingGIF.src = `gif/${rand}.gif`
        loadingGIF.classList.remove('hidden')
    }
    else {
        loadingGIF.classList.add('hidden')
    }
}

const handlePress = function () {
        let serial = serialField.value
        username = usernameField.value
        password = passwordField.value
        if (username == '' || password == '') {
             alert('Try again: 3ID and/or password cannot be blank. \nTip: Daniel Craig is James Bond.')
             return 0
        }
        getPotd(serial,username,password)
}
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

    potdField.innerHTML = 'Fetching, please wait...'
    
    jamf.get(`/computers/name/${serial}`, function (err,res) {

        console.log(res)
        if (err) {
            if (err == 404) {
                alert(`${serial} not found!`)
                potdField.innerHTML = '...'
            }
        else if (res == null) {
                alert('Unauthorized! Check 3ID and password.')
                potdField.innerHTML = '...'
            }
        }else {
            potdField.style.fontSize = '3em'
            const computer = res.computer
            const potd = computer.extension_attributes.find(element => element.id == 1430)
            const lastCheckIn = computer.general.last_contact_time
            const site = computer.general.site.name

            siteCodeField.innerHTML = `Site: ${site}`
            checkInField.innerHTML = `as of ${lastCheckIn}`
            potdField.innerHTML = potd.value
            copyButton.classList.remove('hidden')
            showGIF(false)
            
        }
    })
}

