const mongoose = require('mongoose');

const buttonRolesSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    buttons: [{
        customId: { type: String, required: true },
        roleId: { type: String, required: true },
        label: { type: String, required: true },
        style: { type: String, default: 'PRIMARY' },
        emoji: { type: String }
    }]
});

module.exports = mongoose.model('ButtonRoles', buttonRolesSchema);