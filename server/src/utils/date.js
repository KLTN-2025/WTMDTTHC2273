exports.getDateRange = (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
};

exports.getTodayRange = () => {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
};

exports.getSevenDaysAgo = () => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 6);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};
