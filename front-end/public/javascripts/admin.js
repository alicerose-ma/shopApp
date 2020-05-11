const endpoints = 'https://uc2acbxet8.execute-api.us-east-1.amazonaws.com/dev/api/';


function AdminSignin(obj, callback) {
    const url = endpoints + 'admin/signin';
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
                    localStorage.setItem('adminToken', token);
                } else {
                    sessionStorage.setItem('adminToken', token);
                }
                return callback(null,data);
            } else {
                return callback(data.msg,null)
            }
        })
        .catch((err) => {
            return callback(err, null);
        })
}

function loadAdminToken() {
    const tokenLocal = localStorage.getItem('adminToken');
    const tokenSession = sessionStorage.getItem('adminToken');
    if (tokenLocal || tokenSession) {
        window.location.href = '/admin/products';
    }
}

function getAdminToken() {
    const tokenLocal = localStorage.getItem('adminToken');
    const tokenSession = sessionStorage.getItem('adminToken');
    if (tokenLocal) {
        return tokenLocal;
    } else if (tokenSession) {
        return tokenSession;
    } else {
        window.location.href = '/admin/signin';
    }
}
function checkAdminIsSignIn(){
    const tokenLocal = localStorage.getItem('adminToken');
    const tokenSession = sessionStorage.getItem('adminToken');
    if (!tokenLocal && !tokenSession) {
        window.location.href = '/admin/signin';
    } 
}
function adminSignout() {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken')
    window.location.href = '/admin/signin';
}

function adminGetProducts(callback) {
    const url = endpoints + 'product/listall';
    var request = new Request(url, {
        method: 'GET',
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json'
        }
    });
    fetch(request)
        .then((res) => {
            const statusCode = res.status;
            if (statusCode === 401){
                window.location.href = '/admin';
            }
            return res.json()
        })
        .then((data) => {
            console.log(data)
            if (data.success) {
                return callback(null, data);
            } else {
                return callback(data.msg, null);
            }
        })
        .catch((err) => {
            return callback(err, null);
        })
}

function adminRemoveProduct(productIdStr) {
    var r = confirm("Are you sure you want to delete this item?");
    if (r == true) {
        const productId = productIdStr.split('_')[1];
        const url = endpoints + 'product/delete';
        var request = new Request(url, {
            method: 'POST',
            body: JSON.stringify({ productId }),
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAdminToken()
            }
        });
        fetch(request)
            .then((res) => { 
                const statusCode = res.status;
                if (statusCode === 401) {
                    window.location.href = '/admin';
                }
                else {
                    return res.json()
                }
            })
            .then((data) => {
                window.location.href = '/admin/products';
            })
            .catch((err) => {
                return callback(err, null);
            })
    }
}

function adminEditProduct(productIdStr) {
    const productId = productIdStr.split('_')[1];
    console.log(productId);
    window.location.href = `/admin/product/update?productId=${productId}`;
}

function getProductById(productId, callback) {
    const url = endpoints + 'product/get';
    var request = new Request(url, {
        method: 'POST',
        body: JSON.stringify({ productId }),
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAdminToken()
        }
    });
    fetch(request)
        .then((res) => { 
            const statusCode = res.status;
            if (statusCode === 401) {
                window.location.href = '/admin';
            }
            else {
                return res.json()
            }
        })
        .then((data) => {
            if (data.success) {
                return callback(null, data);
            } else {
                return callback(data.msg, null);
            }
        })
        .catch((err) => {
            return callback(err, null);
        })
}

function updateProduct(data, callback) {
    const url = endpoints + 'product/update';
    var request = new Request(url, {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAdminToken()
        }
    });
    fetch(request)
        .then((res) => {
            const statusCode = res.status;
            if (statusCode === 401) {
                window.location.href = '/admin';
            }
            else {
                return res.json()
            }
        })
        .then((data) => {
            if (data.success) {
                return callback(null, data);
            } else {
                return callback(data.msg, null);
            }
        })
        .catch((err) => {
            return callback(err, null);
        })
}

function createProduct(data, callback) {
    const url = endpoints + 'product/create';
    console.log(data);
    var request = new Request(url, {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAdminToken()
        }
    });
    fetch(request)
        .then((res) => { 
            const statusCode = res.status;
            if (statusCode === 401) {
                window.location.href = '/admin';
            }
            else {
                return res.json()
            }
        })
        .then((data) => {
            if (data.success) {
                return callback(null, data);
            } else {
                return callback(data.msg, null);
            }
        })
        .catch((err) => {
            return callback(err, null);
        })
}


const toBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(null, reader.result);
    reader.onerror = error => callback(error, null);
}

function uploadImage(data, callback) {
    const url = endpoints + 'product/uploadimage';
    console.log(data);

    var request = new Request(url, {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAdminToken()
        }
    });
    fetch(request)
        .then((res) => {
            const statusCode = res.status;
            if (statusCode === 401) {
                window.location.href = '/admin';
            }
            else {
                return res.json()
            }
        })
        .then( (data) => {
            if (data.success){
                return callback(null, data)
            }
             else {
                return callback(data.msg, null)
            }
        })
        .catch((error) => {
            return callback(error, null)
        })
}
const isAdminSignin = () => {
    const tokenLocal = localStorage.getItem('adminToken');
    const tokenSession = sessionStorage.getItem('adminToken');
    if ( tokenLocal || tokenSession) {
        return true;
    }
    else {
        return false;
    }
}