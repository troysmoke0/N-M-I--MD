function EliteProTechId() {
    return Math.random().toString(36).substring(2, 10);
}

function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
    EliteProTechId,
    generateRandomCode
};