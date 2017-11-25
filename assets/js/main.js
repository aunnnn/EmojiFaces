var emoji_list = ["😀","😁","😂","😃","😄","😅","😆","😇","😈","👿","😉","😊","☺️","😋","😌","😍","😎","😏","😐","😑","😒","😓","😔","😕","😖","😗","😘","😙","😚","😛","😜","😝","😞","😟","😠","😡","😢","😣","😤","😥","😦","😧","😨","😩","😪","😫","😬","😭","😮","😯","😰","😱","😲","😳","😴","😵","😶","😷", "💩"];

function showStep2() {
  hideStep3();
  $('div.row.title-2').fadeIn(500);
  $('div.row.preview').fadeIn(500);
}

function hideStep2() {
  $('div.row.title-2').hide(0);
  $('div.row.preview').hide(0);
}

function showStep3() {
  hideStep2();
  $('div.row.title-done').fadeIn(500);
  $('div.row.canvas-container').fadeIn(500);
  $('#share-fb').fadeIn(500);
}

function hideStep3() {
  $('div.row.title-done').hide();
  $('div.row.canvas-container').hide();
  $('#share-fb').hide();
}

function clearCookies() {
  function delete_cookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
  }
  
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    if(cookies[i].split("=")[0].indexOf("fblo_") != -1)
      delete_cookie(cookies[i].split("=")[0]);
  }
}

function drawEmojiOnFaces(ctx, comp) {
  for (let index = 0; index < comp.length; index++) {
    let face = comp[index]
    var emoji = emoji_list[Math.floor(Math.random() * emoji_list.length)];
    // ctx.fillStyle= "rgba(255, 0, 0, 0.4)";
    // ctx.fillRect(face.x, face.y, face.width, face.height);
    ctx.font = String(Math.ceil(face.width*1.4)) + "px Georgia";
    ctx.textBaseline = 'middle';
    ctx.textAlign = "center";
    ctx.fillText(emoji, face.x+face.width/2, face.y+face.height/2, face.width*1.4);
  }
}

// function canvasToGIF(img, successHandler) {
//   var canvas = document.getElementById('canvas');
//   var ctx = canvas.getContext('2d');
//   var gif = new GIF({
//     workers: 2,
//     quality: 10,
//     width: 256,
//     height: 256,
//   });
  
//   ctx.drawImage(img, 0, 0, 256, 256);

//   gif.addFrame(ctx, {copy: true});

//   ctx.drawImage(img, 10, 10, 236, 236);

//   gif.addFrame(ctx, {copy: true});

//   ctx.drawImage(img, 20, 20, 216, 216);
  
//   gif.addFrame(ctx, {copy: true});
  
//   gif.on('finished', function(blob) {
//     var finishedURL = URL.createObjectURL(blob)
//     successHandler(finishedURL, blob)
//     $('#share-img').attr('src', finishedURL);
//   });
  
//   gif.render();
// }

function main() {
  
  var selector, logActivity, callbackAlbumSelected, callbackPhotoUnselected, callbackSubmit;
	var $buttonOK = $('#CSPhotoSelector_buttonOK');
  var o = this;
  
  var $image_cropper = $('#preview-cropper-image')
  $image_cropper.cropper(cropperOptions);

  // ---------------
  // On Select FB Photo
  // ---------------

  fbphotoSelect = function(id) {
		// if no user/friend id is sent, default to current user
    if (!id) id = 'me';

		callbackAlbumSelected = function(albumId) {
			var album, name;
			album = CSPhotoSelector.getAlbumById(albumId);
			// show album photos
			selector.showPhotoSelector(null, album.id);
		};

		callbackAlbumUnselected = function(albumId) {
			var album, name;
			album = CSPhotoSelector.getAlbumById(albumId);
		};

		callbackPhotoSelected = function(photoId) {
			var photo;
			photo = CSPhotoSelector.getPhotoById(photoId);
			$buttonOK.show();
		};

		callbackPhotoUnselected = function(photoId) {
			var photo;
			album = CSPhotoSelector.getPhotoById(photoId);
			$buttonOK.hide();
		};

		callbackSubmit = function(photoId) {
			var photo;
      photo = CSPhotoSelector.getPhotoById(photoId);
      $image_cropper.cropper('replace', photo.source);
      showStep2();
		};


		// Initialise the Photo Selector with options that will apply to all instances
    CSPhotoSelector.init({debug: true});

		// Create Photo Selector instances
		selector = CSPhotoSelector.newInstance({
			callbackAlbumSelected	: callbackAlbumSelected,
			callbackAlbumUnselected	: callbackAlbumUnselected,
			callbackPhotoSelected	: callbackPhotoSelected,
			callbackPhotoUnselected	: callbackPhotoUnselected,
			callbackSubmit			: callbackSubmit,
			maxSelection			: 1,
			albumsPerPage			: 6,
			photosPerPage			: 200,
      autoDeselection			: true
		});

		// reset and show album selector
		selector.reset();
    selector.showAlbumSelector(id);
  }

  // ---------------
  // FB Login & Browse
  // ---------------  
  var fbAuth;
  $("#btn-browse-fb").click(function (e) {
    e.preventDefault();
    if (fbAuth) {
      FB.getLoginStatus(function (response) {
        if (response.status === "connected") {
          fbphotoSelect();
        } else {
          alert('Error FB: ' + response.status);
        }
      });
    } else {
      clearCookies()
      FB.login(function (response) {
        fbAuth = response.authResponse;
        if (fbAuth) {
          $("#btn-browse-fb").html('From Facebook Album');
          fbphotoSelect();
        } else {
          $("#btn-browse-fb").html('From Facebook');
          alert('Failed to login facebook.');
        }
      }, {scope: 'user_photos'});
    }
  });

  // ---------------
  // Device Browse
  // ---------------
  $('#btn-browse-device').click(function(){
		$('.browse-hide').trigger('click');
  });

  var cropperOptions = {
    aspectRatio: 1,
    viewMode: 2,
    dragMode: "move",
    autoCropArea: .9,
    cropBoxMovable: 1,
    cropBoxResizable: 1,    
    minCropBoxWidth: 120
  }
  
  var $deviceBrowse = $('#deviceBrowse');

  var uploadedImageType = 'image/jpeg';
  var uploadedImageURL;

  $deviceBrowse.change(function() {
    var files = this.files;
    var file;

    if (!$image_cropper.data('cropper')) {
      return;
    }

    if (files && files.length) {
      file = files[0];

      if (/^image\/\w+$/.test(file.type)) {
        uploadedImageType = file.type;

        if (uploadedImageURL) {
          URL.revokeObjectURL(uploadedImageURL);
        }

        uploadedImageURL = URL.createObjectURL(file);
        $image_cropper.cropper('destroy').attr('src', uploadedImageURL).cropper(cropperOptions);
        $deviceBrowse.val('');
        showStep2()
      } else {
        window.alert('Please choose an image file.');
      }
    }
  })

  var img;

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  $('#confirm-crop-button').click(function () {
    var imageData = $image_cropper.cropper('getCroppedCanvas').toDataURL();

    // load image from data url
    img = new Image();
    img.src = imageData;
    img.onload = function() {
      ctx.drawImage(img, 0, 0, 320, 320);

      function handleFaces(comp) {
        if (comp && comp.length) {          
          drawEmojiOnFaces(ctx, comp);
          showStep3();
        } else {
          alert('No face detected :(');
          hideStep3();
        }
      }

      var tracker = new tracking.ObjectTracker(['face']);
      tracker.setStepSize(1.7);
      tracker.on('track', function(event) {
        if (event.data && event.data.length) {
          handleFaces(event.data);
        } else {
          alert('No face :(');
          hideStep3();
        }
      });
      tracking.track('#canvas', tracker);
    };
  })


  var blob;
  $('#share-fb').click(function () {    
    var data = $('#canvas')[0].toDataURL("image/jpeg");
    try {
        blob = dataURItoBlob(data);        
    } catch (e) {
        console.log(e);
    }
    function postedCallback(data) {
      alert("Your photo is posted on Facebook! 😂");      
      $('#success-msg').fadeIn(500);
    }
    function errorCallback(data) {
      $('#share-fb').show();
      alert('Error: ' + data);
    }

    var caption = 'Check out my #EmojiFaces';

    $('#share-fb').hide();

    FB.getLoginStatus(function (response) {
      if (response.status === "connected") {
          postImageToFacebook(response.authResponse.accessToken, "Canvas to Facebook/Twitter", "image/jpeg", blob, caption, postedCallback, errorCallback);
      } else if (response.status === "not_authorized") {
          FB.login(function (response) {
              postImageToFacebook(response.authResponse.accessToken, "Canvas to Facebook/Twitter", "image/jpeg", blob, caption, postedCallback, errorCallback);
          }, {scope: "publish_actions"});
      } else {
          FB.login(function (response) {
              postImageToFacebook(response.authResponse.accessToken, "Canvas to Facebook/Twitter", "image/jpeg", blob, caption, postedCallback, errorCallback);
          }, {scope: "publish_actions"});
      }
    });
  });
}