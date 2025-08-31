class ApiError extends Error{  // this (apiError) class extends the built-in Error class.
    constructor(
        statusCode,
        message = 'Something went wrong !!!',
        errors = [],
        stack = ''      //error stack
    ){
        super(message)   //Call parent (Error) constructor with the message
        this.statusCode = statusCode  
        this.data = null                //additional data if needed
        this.message= message
        this.success= false             //for APIs, usually false on error
        this.errors = errors

        if(statck){
            this.stack = stack          //custom stack trace if passed
        }
        else{
            Error.captureStackTrace(this, this.constructor)         //// generates a stack trace automatically
        }

    }
}


export {ApiError}

// this is used in throw structured errors