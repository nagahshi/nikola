const nodemailer = require('nodemailer')

class Mailer {
  constructor () {
    let options = {
      host: process.env.MAILER_HOST,
      port: process.env.MAILER_PORT,
      secure: (process.env.MAILER_PORT == 465), // true for 465, false for other ports
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD
      }
    }
    this.transporter = nodemailer.createTransport(options)
  }

  /**
   * @description prepare and send email
   * @param from - who send this email
   * @param to - who receive this
   * @param subject - title email
   * @param text - if send text
   * @param html - if send html
   */
  send (from = '', to = '', subject = '', html = '', text = '') {
    let mailOptions = {
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html // html body
    }

    this.transporter.sendMail(mailOptions, (error) => {
      if (error) return console.log(error)
    })
  }
}

module.exports = Mailer
