const { OK, BadRequestError } = require('../core/success.response');
const modelContact = require('../models/contact.model');
const mailReplyContact = require('../utils/replyContact');

class controllerContact {
    async createContact(req, res) {
        const { id } = req.user;
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            throw new BadRequestError('Vui lòng nhập đày đủ thông tin');
        }
        const newContact = await modelContact.create({ name, email, message, userId: id, status: false });
        await newContact.save();
        new OK({ message: 'Gửi liên hệ thành công', metadata: newContact }).send(res);
    }

    async getContact(req, res) {
        const contact = await modelContact.find({});
        new OK({ message: 'Lấy thiing tin thành công', metadata: contact }).send(res);
    }

    async replyContact(req, res) {
        const { message, id } = req.body;
        const contact = await modelContact.findById(id);
        await mailReplyContact(contact.email, message);
        contact.status = true;
        await contact.save();
        new OK({ message: 'Trả lời liên hệ thành công' }).send(res);
    }
}

module.exports = new controllerContact();
