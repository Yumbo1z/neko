const mongoose = require('mongoose');

const buttonRolesSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    panels: [{
        name: { type: String },
        roles: { type: Array }
    }]
});

module.exports = mongoose.model('ButtonRoles', buttonRolesSchema);