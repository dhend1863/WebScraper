const makeDate = function() {
    const d = new Date();
    const formattedDate = "";

    formattedDate += (d.getMonth() + 1) + "_";

    formattedDate += d.getDate() + "_";

    formattedDate +=d.getFullYear();

    return formattedDate;

};

module.exports = makeDate;