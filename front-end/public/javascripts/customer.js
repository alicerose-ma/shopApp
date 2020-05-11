
const customerSignup = (data,callback) => {
    const url = endpoints + 'customer/signup';
    var request = new Request(url, {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
        .then((res) => { return res.json() })
        .then((data) => {
            if (data.success) {
                return callback(null,data.data);
            }
            else {
                return callback(data.msg,null);
            }
    })
    .catch((err) => {
        console.log(err)
    })
}

const customerSignin = (obj,callback) => {
    const url = endpoints + 'customer/signin';
    var request = new Request(url, {
        method: 'POST',
        body: JSON.stringify(obj),
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
        .then((res) => { return res.json() })
        .then((data) => {
            if (data.success) {
                const token = data.data.token;
                if (obj.rememberMe) {
                    localStorage.setItem('customerToken', token);
                } else {
                    sessionStorage.setItem('customerToken', token);
                }
                return callback(null,data.data);
            }
            else {
                return callback(data.msg,null);
            }
    })
    .catch((err) => {
        console.log(err)
    })
}
const isCustomerSignin = () => {
    const tokenLocal = localStorage.getItem('customerToken');
    const tokenSession = sessionStorage.getItem('customerToken');
    if ( tokenLocal || tokenSession) {
        return true;
    }
    else {
        return false;
    }
}
const customerSignout = () => {
    localStorage.removeItem('customerToken');
    sessionStorage.removeItem('customerToken')
    window.location.href = '/';
}