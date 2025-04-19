import nodemailer from "nodemailer"

const mailSender = async (email, title, body) => {
    try{
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        })

        let info = await transporter.sendMail(
            {
                from : `Easy Emi `,
                to : `${email}`,
                subject: `${title}`,
                html: `${body}`
            }
        )
        console.log("Message sent ");
        console.log(info);
        return info
    }catch(error){
        console.log(email)
        console.log(title)
        console.log("error in sending mail", error)
    }
}

export {mailSender}