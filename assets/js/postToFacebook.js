function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: 'image/png'});
}

function postImageToFacebook(token, filename, mimeType, imageData, message, successCallback, errorCallback) {
  console.log('post...', imageData);
  var fd = new FormData();
  fd.append("access_token", token);
  fd.append("source", imageData);
  fd.append("caption", message);
  $.ajax({
      url: "https://graph.facebook.com/me/photos?access_token=" + token,
      type: "POST",
      data: fd,
      processData: false,
      contentType: false,
      cache: false,
      success: function (data) {
        console.log("success: ", data);
        successCallback(data);
      },
      error: function (shr, status, data) {
        console.log("error " + data + " Status " + shr.status);
        errorCallback(data);
      },
      complete: function (data) {
          //console.log('Post to facebook Complete');
      }
  });
}