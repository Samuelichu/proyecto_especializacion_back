const { checkConnection } = require("../database/connection");

function health(req, res) {
  res.json({
    status: "ok",
    service: "taskflow-api-Samuel-v4",
    timestamp: new Date().toISOString(),
  });
}

async function databaseHealth(req, res) {
  try {
    await checkConnection();
    res.json({
      status: "ok",
      service: "taskflow-mysql-Samuel-v4",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "taskflow-mysql-Samuel-v4",
      code: error.code,
      message: error.message,
    });
  }
}

module.exports = {
  databaseHealth,
  health,
};
