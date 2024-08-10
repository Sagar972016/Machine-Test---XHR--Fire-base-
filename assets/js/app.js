const cl = console.log;

const postContainerId = document.getElementById("postContainer");
const postForm = document.getElementById("postForm");
const titleControl = document.getElementById("title");
const contentControl = document.getElementById("content");
const userIdControl = document.getElementById("userId");
const submitBtnId = document.getElementById("submitBtn");
const updateBtnId = document.getElementById("updateBtn");
const loader =  document.getElementById("loader");

let BASE_URL = `https://xhr---post-default-rtdb.asia-southeast1.firebasedatabase.app/`
let POST_URL = `${BASE_URL}/posts.json`;

let sweetAleart = (A, B) => {
    Swal.fire({
        title : A,
        timer : 4000,
        icon : B
    })
}

const templating = (arr) => {
    let result = ``
    arr.forEach(post => {
        result += `
            <div class="col-md-4 mb-4">
                <div class="card postCard p-card h-100"  id="${post.id}">
                    <div class="card-header">
                        <h3>${post.title}</h3>
                    </div>
                    <div class="card-body mid-bg">
                        <p>${post.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onClick = "onEdit(this)" class="btn btn-sm btn-outline-primary">EDIT</button>
                        <button onClick = "onDelete(this)" class="btn btn-sm btn-outline-danger">DELETE</button>
                    </div>
                </div>
            </div>
        `
        postContainerId.innerHTML = result;
    })
}

const makeApiCall = (methodName, api_url, msgBody = null) => {
    return new Promise ((resolve, reject) => {
        loader.classList.remove("d-none");
        let xhr = new XMLHttpRequest();
        xhr.open(methodName, api_url);
        xhr.onload = function (){
            if(xhr.status >= 200 && xhr.status < 300){
                let data = JSON.parse(xhr.response)
                resolve(data);
            }else{
                reject(`Somthing Went Wrong !!!`);
            }
            loader.classList.add("d-none");
        }
        xhr.onerror = function(){
            loader.classList.add("d-none");
        }
        xhr.send(JSON.stringify(msgBody));
    })
}


const fetchPost = async () => {
    try{
        let res = await makeApiCall("GET", POST_URL);
        // cl(res)
        let postArr = [];
        for(const key in res){
            let obj = {...res[key], id : key};
            postArr.unshift(obj);
            templating(postArr)
            // cl(postArr)
            loader.classList.add("d-none");
        }
    }catch{
        sweetAleart(err, "error");
        loader.classList.add("d-none");
    }
}
fetchPost();

const onEdit = async (eve) => {
    try{
        let editId = eve.closest('.card').id;
        localStorage.setItem("editId", editId);
        let EDIT_URL = `${BASE_URL}/posts/${editId}.json`
        let res = await makeApiCall("GET", EDIT_URL)
        titleControl.value = res.title;
        contentControl.value = res.body;
        userIdControl.value = res.userId
        window.scroll({
            top : 0,
            left : 0,
            behavior : "smooth"
        })
        loader.classList.add("d-none");
    }catch{
        sweetAleart(err, "error")
    }finally{
        submitBtnId.classList.add("d-none");
        updateBtnId.classList.remove("d-none");
        loader.classList.add("d-none");
    }
}

const onPostUpdate = async () => {
    try{
        let updateBtnId = localStorage.getItem("editId");
        let UPDATE_URL = `${BASE_URL}/posts/${updateBtnId}.json`

        let updatedObj = {
            title : titleControl.value,
            body : contentControl.value,
            userId : userIdControl.value,
        }
        let res = await makeApiCall("PATCH", UPDATE_URL, updatedObj);
            let card = [...document.getElementById(updateBtnId).children]
            card[0].innerHTML = `<h3>${updatedObj.title}</h3>`
            card[1].innerHTML = `<p>${updatedObj.body}<p>`
            sweetAleart("POST IS UPDATED SUCCESSFULLY !!!", "success")


    }catch{
        sweetAleart(err, 'error')
    }finally{
        updateBtnId.classList.add("d-none");
        submitBtnId.classList.remove("d-none");
        postForm.reset();
    }
}

const onDelete = (eve) => {
    let removeId = eve.closest(".card").id;
    let REMOVE_URL = `${BASE_URL}/posts/${removeId}.json`;

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          makeApiCall("DELETE" , REMOVE_URL)
            .then(res => {
                eve.closest(".card").parentElement.remove();
                sweetAleart("POST IS DELETED SUCCESSFULLY !!!", 'success')
            })
            .catch(err => {
                sweetAleart(err, "error")
            })
            .finally(() => {
                loader.classList.add("d-none");
            })
        }else{
            loader.classList.add("d-none");
        }
      });
}

const onAddNewPost = async (eve) => {
    loader.classList.remove("d-none");

    try{
        eve.preventDefault();
        let newPost = {
            title : titleControl.value,
            body : contentControl.value,
            userId : userIdControl.value
        }
        // cl(newPost)

        let res = await makeApiCall("POST", POST_URL, newPost);
        newPost.id = res.name
        let div = document.createElement("div")
        div.className = `col-md-4 mb-4`;
        div.innerHTML = `
                <div class="card postCard p-card h-100" id="${newPost.id}">
                    <div class="card-header">
                        <h3>${newPost.title}</h3>
                    </div>
                    <div class="card-body">
                        <p>${newPost.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onClick = "onEdit(this)" class="btn btn-sm btn-outline-primary">EDIT</button>
                        <button onClick = "onDelete(this)" class="btn btn-sm btn-outline-danger">DELETE</button>
                    </div>
                </div>
        `
        postContainerId.prepend(div);
        sweetAleart("NEW POST IS ADDED SUCCESSFULLY !!!", "success")
    }catch{
        sweetAleart(err, "error")
    }finally{
        postForm.reset();
        loader.classList.add("d-none");

    }
    
}



postForm.addEventListener("submit", onAddNewPost);
updateBtnId.addEventListener("click" , onPostUpdate);