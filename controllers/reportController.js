const ReportModel = require('../models/reportModel');

const getSalesReport = async (req, res, next) => {
    try {
        const { period } = req.query; // 'daily' or 'monthly'
        const report = await ReportModel.getSalesStats(period);
        res.status(200).json({ success: true, period: period || 'daily', report });
    } catch (e) { next(e); }
};

const getProductReport = async (req, res, next) => {
    try {
        const report = await ReportModel.getProductPerformance();
        res.status(200).json({ success: true, report });
    } catch (e) { next(e); }
};

const getPeakTimesReport = async (req, res, next) => {
    try {
        const peakTimes = await ReportModel.getPeakOrderTimes();
        res.status(200).json({ success: true, peak_times: peakTimes });
    } catch (e) { next(e); }
};

module.exports = { getSalesReport, getProductReport, getPeakTimesReport };
