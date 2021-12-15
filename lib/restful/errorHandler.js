const devHandleErrors = (err, req, res, next) => {
  res.status(500).json({
    status: 500,
    message: err.message,
    stack: err.stack
  });

}

const handleErrors = (err, req, res, next) => {
  return res.status(500).json({
    status: 500,
    message: err.message
  });
}

export default process.env.NODE_ENV === 'production' ? handleErrors : devHandleErrors;