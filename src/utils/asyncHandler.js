// asyncHnadler using promise

const asyncHandler = (requestHnadler )=>{
    return (req, res, next) => {
        Promise.resolve(requestHnadler(req, res, next ))
        .catch((err) => next(err));
    }
}
// Promise.resolve(...) ensures the handler is treated as a Promise
// f an error happens inside an async route handler, Express won’t automatically catch it—you need to call next(err) manually
// manually invoke Promise -> if promise resolve  -> execute 'requestHnadler' function pass all parameter 
// If requestHnadler throws an error forwards the error to Express’s error-handling middleware. 






export {asyncHandler} 

// const asyncHandler = () => {}

// const asyncHandler = (fn) => {() => {}}   // it is a higher order function, it takes a function as aparameter

// asyns handler using try catch 

/* const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next )
    } catch (error) {
        res.status(err.code || 500).json({
            success:false,
            message:err.message
        })
    }
} */