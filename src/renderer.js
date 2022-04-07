const JamfApiClient = require('jamf')

const submitButton = document.querySelector('#submit')
const potdField = document.querySelector('#potdField')
const serialField = document.querySelector('#serial')
const usernameField = document.querySelector('#username')
const passwordField = document.querySelector('#password')
const checkInField = document.querySelector('#lastCheckIn')
const siteCodeField = document.querySelector('#siteCode')

const copyButton = document.querySelector('#copyToClipboard')

submitButton.addEventListener('click', () => {
    let serial = serialField.value
    username = usernameField.value
    password = passwordField.value
    getPotd(serial,username,password)
})

copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(potdField.innerHTML)
    alert('Copied!')
})


function getPotd(serial,username,password) {
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
            alert(err)
            potdField.innerHTML = 'Error! Check credentials and SN.'
        }else {
            const computer = res.computer
            const potd = computer.extension_attributes.find(element => element.id == 1430)
            const lastCheckIn = computer.general.last_contact_time
            const site = computer.general.site.name

            siteCodeField.innerHTML = `Site: ${site}`
            checkInField.innerHTML = `as of ${lastCheckIn}`
            potdField.innerHTML = potd.value
            
        }
    })
}

