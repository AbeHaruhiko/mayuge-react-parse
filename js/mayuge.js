var mainCtrl = function($scope, $http, $compile) {

  $scope.changeAllMayugeType = function() {
    $(".draggable > use", svgWrapper.root()).each(function(index, element) {

      $(element).attr('href', "#path-r-mayuge-" + $scope.conf.mayugeType);
    })
    $scope.export2canvas();
  };

  $scope.changeAllMayugeColor = function() {
    $(".draggable > use", svgWrapper.root()).each(function(index, element) {

      $(element).attr('fill', $('select[name="colorpicker4mayuge"]').val());
    })
    $scope.export2canvas();
  };

  $scope.changeAllRinkakuColor = function() {
    $(".draggable > use", svgWrapper.root()).each(function(index, element) {

      $(element).attr('stroke', $('select[name="colorpicker4rinkaku"]').val());
    })
    $scope.export2canvas();
  };

  $scope.changeAllRinkakuWidth = function() {
    $(".draggable > use", svgWrapper.root()).each(function(index, element) {

      $(element).attr('stroke-width', $('select[name="rinkakuWidth"]').val());
    })
    $scope.export2canvas();
  };


  $scope.setFiles = function(element) {
      $scope.$apply(function($scope) {
        // console.log('files:', element.files);
        // Turn the FileList object into an Array
          $scope.files = []
          for (var i = 0; i < element.files.length; i++) {
            $scope.files.push(element.files[i])
          }
        $scope.progressVisible = false
        });
      };
  $scope.upload = function() {

    $scope.progressbar.progress = 10;
    $scope.$apply('progressbar.show = true');

    var fd = new FormData()
    for (var i = 0; i < $scope.files.length; i++) {
        fd.append("imageSelector", $scope.files[i])
    }
    $.ajax({
      url: './proxy.php',
      type: 'POST',
      data: fd,
      dataType: 'xml',
      contentType: false, // デフォルトの値は application/x-www-form-urlencoded; charset=UTF-8'
      processData: false  // デフォルトの値は application/x-www-form-urlencoded
    })
    .done($scope.onUploadCompleted)
    .fail(function(xhr, status, exception) {
      console.log(status);
      $scope.alertboxdata.status = 'error';
      $scope.alertboxdata.message = 'アップロードに失敗しました。' + exception;
      $scope.$apply('alertboxdata.show = true');

    });

  }

  $scope.onUploadCompleted = function(res) {

    $scope.progressbar.progress = 20;
    $scope.$apply('progressbar.show = true');

    console.log(res);
    // $('#alertbox').alert('close');

    // 顔情報でなくメッセージが返ってきた場合
    var message = $(res).find("message").attr("val");
    if (message && message != "") {
      $scope.alertboxdata.status = 'error';
      $scope.alertboxdata.message = 'アップロードに失敗しました。' + message;
      $scope.$apply('alertboxdata.show = true');
      $("#progressbar").fadeOut(1000);
      return;    
    }

    detectedFaces = res;

    $scope.getSVG();
  }

  $scope.getSVG = function() {

    $scope.progressbar.progress = 30;
    $scope.$apply('progressbar.show = true');

    // jquery-svg使用時
    $("#svgArea").css("display", "");
    $("#svgArea").svg('destroy');
    $("#svgArea").width(selectedImageWidth).height(selectedImageHeight);
    $("#svgArea").svg();
    svgWrapper = $("#svgArea").svg('get');

    $scope.progressbar.progress = 40;
    $scope.$apply('progressbar.show = true');

    svgWrapper.load("./svg/golgo3.svg",   
    {  
        onLoad: $scope.loadSvgCompleteHandler,
    });
  }

  $scope.loadSvgCompleteHandler = function(svgXml) {

    $scope.progressbar.progress = 50;
    $scope.$apply('progressbar.show = true');


    // 表示
    $scope.$apply('conf.showToolBox = true');
    $scope.toggleMayugeTypeBoxDisplay();
    $('#svgArea').tooltip('show');

    // 手描き準備
    $("#svgArea").on("mousedown", "image", startDrag).on("mousemove", "image", dragging).on("mouseup", "image", endDrag);


    // jquery-svg使用時
    svgWrapper.image(0, 0, selectedImageWidth, selectedImageHeight, localImage.src);

    // // raphael使用
    // var paper = Raphael("svgArea", selectedImageWidth, selectedImageHeight);
    // paper.importSVG(svgXml);

    // 認識された顔
    if ($scope.conf.faceDetect) {

      var mayugeColor = $('select[name="colorpicker4mayuge"]').val();
      var rinkakuColor = $('select[name="colorpicker4rinkaku"]').val();
      var rinkakuWidth = $('select[name="rinkakuWidth"]').val();

      $(detectedFaces).find("face").each(function () {

        // 左目
        var pointER1 = $(this).find("#ER1");
        var xER1 = ~~pointER1.attr("x");
        var yER1 = ~~pointER1.attr("y");


        // 右眉
        var pointBR1 = $(this).find("#BR1");
        var pointBR5 = $(this).find("#BR5");
        var xBR1 = ~~pointBR1.attr("x");
        var yBR1 = ~~pointBR1.attr("y");
        var xBR5 = ~~pointBR5.attr("x");
        var yBR5 = ~~pointBR5.attr("y");
        // console.log(xBR1 + " : " + yBR1 + " : " + xBR5 + " : " + yBR5);
        var lenBR = Math.sqrt(Math.pow(xBR1 - xBR5, 2) + Math.pow(yBR1 - yBR5, 2))
        // console.log(lenBR);
        var scaleBR = lenBR/95 * 1.2

        widthBR = xBR1 - xBR5;
        heightBR = yBR1 - yBR5;

        dblRadian = Math.atan(heightBR / widthBR);
        dgr = dblRadian/(Math.PI/180);


        // jquery-svg使用時
        // var grpRMayuge = svgWrapper.group({class_: "draggable", transform: "translate(" + ((xBR1 + xER1)/2) + "," + ((yBR1 + yER1)/2) + ")"});
        var grpRMayuge = svgWrapper.group({class_: "draggable", transform: "translate(" + xBR1 + "," + yBR1 + ")"});
        // svgWrapper.use(grpRMayuge, "#path-r-mayuge", {fill: "black", transform: "scale(" + scaleBR + "),rotate(" + dgr + ")", strokeWidth: "1"})
        svgWrapper.use(grpRMayuge, "#path-r-mayuge-" + $scope.conf.mayugeType, {fill: mayugeColor, transform: "scale(" + scaleBR + ")", stroke: rinkakuColor, strokeWidth: rinkakuWidth})

        // 左目
        var pointEL1 = $(this).find("#EL1");
        var xEL1 = ~~pointEL1.attr("x");
        var yEL1 = ~~pointEL1.attr("y");

        // 左眉
        var pointBL1 = $(this).find("#BL1");
        var pointBL5 = $(this).find("#BL5");
        var xBL1 = ~~pointBL1.attr("x");
        var yBL1 = ~~pointBL1.attr("y");
        var xBL5 = ~~pointBL5.attr("x");
        var yBL5 = ~~pointBL5.attr("y");
        // console.log(xBL1 + " : " + yBL1 + " : " + xBL5 + " : " + yBL5);
        var lenBL = Math.sqrt(Math.pow(xBL1 - xBL5, 2) + Math.pow(yBL1 - yBL5, 2))
        // console.log(lenBL);
        var scaleBL = lenBL/95 * 1.2

        widthBL = xBL1 - xBL5;
        heightBL = yBL1 - yBL5;

        dblRadian = Math.atan(heightBL / widthBL);
        dgr = dblRadian/(Math.PI/180);

        // jquery-svg使用時  
        // var grpLMayuge = svgWrapper.group({class_: "draggable", transform: "translate(" + ((xBL1 + xEL1)/2) + "," + ((yBL1 + yEL1)/2) + ")"});
        var grpLMayuge = svgWrapper.group({class_: "draggable", transform: "translate(" + xBL1 + "," + yBL1 + ")"});
        svgWrapper.use(grpLMayuge, "#path-r-mayuge-" + $scope.conf.mayugeType, {fill: mayugeColor, transform: "scale(-" + scaleBL + "," + scaleBL + ")", stroke: rinkakuColor, strokeWidth: rinkakuWidth})



      });

      var makeSVGElementDraggable = svgDrag.setupCanvasForDragging();

      $(".draggable", svgWrapper.root()).each(function(index, element) {
        makeSVGElementDraggable(element);

        element.addEventListener("dblclick", function() {$scope.removeMayuge($(element));});
      })
    }
    detectedFaces = null;

    $scope.export2canvas();
    // if ($scope.conf.autoSave) {
    //   $scope.savePNG();
    // }
    
  }

  $scope.export2canvas = function(doSave) {

    $scope.progressbar.progress = 70;
    $scope.$apply('progressbar.show = true');

    $('[rel=tooltip][data-default-show=true]').tooltip("hide");



    // CANVAS書き出し
    if (!$("#svg-mayuge").attr("xmlns:xlink")){
      $("#svg-mayuge").attr({"xmlns:xlink": $.svg.xlinkNS});
    }
    var xml = svgWrapper.toSVG();
    // console.log(xml);
    // PNG書き出しはレンダリング完了後に行なう
    canvg($("#canvasArea")[0], xml, {renderCallback: function() {$scope.export2pngAndServer(doSave);}});

  }

  $scope.export2pngAndServer = function(doSave) {

    $scope.progressbar.progress = 80;
    $scope.$apply('progressbar.show = true');

    var dataURL = $("#canvasArea")[0].toDataURL();
    // PNG書き出し
    // console.log($("#canvasArea")[0].toDataURL());
    $("#pngArea > img").attr({src: dataURL});

    // メッセージボックス表示
    $scope.$apply('alertboxdata.show = false');

    // サーバに投げる。
    if ($scope.conf.autoSave || doSave) {
      $scope.savePNG();
    } else {
      $scope.progressbar.progress = 100;
      $("#progressbar").fadeOut(1000, function() {
        $('#tooltip4save').tooltip("show");
      });

    }

  }

  $scope.savePNG = function() {

    $('[rel=tooltip]').tooltip("hide");

    $scope.progressbar.progress = 90;
    $scope.$apply('progressbar.show = true');

    // メッセージボックス表示
    $scope.alertboxdata.status = 'info';
    $scope.alertboxdata.message = '保存中...';
    $scope.$apply('alertboxdata.show = true');

    // SVGをレイヤでブロック
    $("#svgArea").block({message: null});

    // var dataURL = $("#canvasArea")[0].toDataURL("image/png");


    var canvas = $("#canvasArea")[0]; 
    if (canvas.toBlob) {
        canvas.toBlob(
            function (blob) {

              var fd = new FormData();
              fd.append('mayugedImage', blob);
              if (currentFile) fd.append('currentFile', currentFile);

              $.ajax({
                url: './save.php',
                type: 'POST',
                data: fd,
                dataType: 'text',
                contentType: false, // デフォルトの値は application/x-www-form-urlencoded; charset=UTF-8'
                processData: false  // デフォルトの値は application/x-www-form-urlencoded
              })
              .done(function(data) {
                console.log(data);
                //history.replaceState("index");
                if (currentFile == null) {
                  history.pushState(data, null, "?file=" + data);
                } else {
                  history.replaceState(data, null, "?file=" + data);
                }
                currentFile = data;
                $("#snsBtn > div").remove();  //G+ボタンとLikeボタン
                $.get("fbcacheclear.php", { url: location.href } ); // FBのキャッシュクリア非同期なので早めに実行しておく

                $("#snsBtn").prepend('<div id="g-plus-share" class="g-plus" data-action="share" data-annotation="bubble"></div>');
                gapi.plus.go('snsBtn');

                // $("#snsBtn > iframe").remove(); // twボタンのiframe用
                // $("#snsBtn > a").remove();
                // $("#snsBtn").append('<a id="tw-share" href="https://twitter.com/share" class="twitter-share-button" data-lang="ja" data-size="large"></a>');
                // $("#tw-share").attr({"data-url": '/?file=' + data});        
                // $("#tw-share").attr({"data-url": location.href});        
                $("#tw-share").attr({"data-url": location.protocol + '//' + location.host + '/imgstore/' + data + '.png'});        
                $("#tw-share").attr({"data-text": 'まゆげジェネレータ(' + location.href + ')'});        
                // $("#tw-share").attr({"data-hashtags": 'まゆげジェネレータ'});        
                twttr.widgets.load();

                $("#snsBtn").append('<div id="fb-share" class="fb-like" data-send="false" data-layout="button_count" data-width="100" data-show-faces="true"></div>');
                $scope.appendMetaInfo( "og:image", location.protocol + '//' + location.host + '/imgstore/' + data + '.png');
                FB.XFBML.parse($('#snsBtn')[0]);

                $("#svgArea").unblock();

                $scope.progressbar.progress = 100;
                // $scope.$apply('progressbar.show = false');
                $("#progressbar").fadeOut(1000);
                $scope.$apply('alertboxdata.show = false');


              })
              .fail(function(xhr, status, exception) {
                console.log(status);
                $("#svgArea").unblock();

                $scope.$apply('alertboxdata.show = false');

              });

            },
            'image/png'
        );
    }

  }

  $scope.openPNG = function(event) {

    $('[rel=tooltip]').tooltip("hide");

    var dataURL = $("#canvasArea")[0].toDataURL();
    window.open(dataURL, 'save');

    // $('<a id="PNGLink" style="display: none;" href="' + dataURL + '"></a>').insertAfter($(event.target)).lightBox().click();

  }

  $scope.dataURItoBlob = function(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for(var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: 'image/png'});
  }

  $scope.popstate = function(event) {

    if (location.pathname == '' || location.pathname == '/') {
      console.log(location.pathname);
      $scope.loadHome();
    } else if (location.pathname == '/about.php') {
      console.log(location.pathname);
      $scope.loadAbout();
    }
  }

  $scope.getUrlGetParams = function()
  {
    var vars, hash;
    var hashes = location.search.substr(1).split("&");
    if (hashes[0] != "") {
      vars = [];
      for(var i = 0; i < hashes.length; i++) {
          hash = hashes[i].split('=');
          vars.push(hash[0]);
          vars[hash[0]] = hash[1];
      }
    }
    return vars;
  }

  $scope.removeMayuge = function(element) {
    element.remove();
    $scope.export2canvas();
    // if ($scope.conf.autoSave) {
    //   $scope.savePNG();
    // }
  }

  $scope.clickFileSelectBtn = function() {
    $('#imageSelector').val('');  // 同じ画像を選択するのに備えクリアする
    $('input[id=imageSelector]').click(); // fileインプットを呼び出す。
  }

  $scope.loadAbout = function() {
    $.ajax({
      url: './about.html',
      type: 'GET',
      dataType: 'html'
    })
    .done(function(res) {
      if (location.pathname != "/about.php")
        history.pushState(res, null, "about.php"); 
      $("#navhome").removeClass("active");
      $("#navabout").addClass("active");
      mainContent = $("#mainContent");
      mainContent.replaceWith(res);
    })

  }

  $scope.loadHome =function() {
    $.ajax({
      url: './home.php',
      type: 'GET',
      dataType: 'html'
    })
    .done(function(res) {
      if (location.pathname != "/")
        history.pushState(res, null, "/" + location.search); 
      $("#navhome").addClass("active");
      $("#navabout").removeClass("active");

      $compile(res)($scope)
      mainContent = $("#mainContent");
      $scope.$apply(function($scope) {
        mainContent.replaceWith($compile(res)($scope));
        $scope.init();
      })

      $("#snsBtn > div").remove();  //G+ボタンとLikeボタン
      $.get("fbcacheclear.php", { url: location.href } ); // FBのキャッシュクリア非同期なので早めに実行しておく

      $("#snsBtn").prepend('<div id="g-plus-share" class="g-plus" data-action="share" data-annotation="bubble"></div>');
      // $("#snsBtn > iframe").remove();
      // $("#snsBtn > a").remove();
      // $("#snsBtn").append('<a id="tw-share" href="https://twitter.com/share" class="twitter-share-button" data-lang="ja" data-size="large"></a>');
      $("#snsBtn").append('<div id="fb-share" class="fb-like" data-send="false" data-layout="button_count" data-width="100" data-show-faces="true"></div>');

      // Getパラメータにファイルが指定されてたら読み込む
      var urlGetParams = $scope.getUrlGetParams();
      if (urlGetParams && urlGetParams.length) {
        var remoteFileName = urlGetParams['file'];
        $("#pngArea > img").attr({src: './imgstore/' + remoteFileName + '.png?' + (new Date()).getTime()});
        $("#pngArea").css("display", "");
        $("#svgArea").css("display", "none");
        $scope.$apply('conf.showToolBox = true');


        // snsボタン
        gapi.plus.go('snsBtn');
        // $("#tw-share").attr({"data-url": '/?file=' + remoteFileName});        
        // $("#tw-share").attr({"data-url": location.href});        
        $("#tw-share").attr({"data-url": location.protocol + '//' + location.host + '/imgstore/' + remoteFileName + '.png'});        
        $("#tw-share").attr({"data-text": 'まゆげジェネレータ(' + location.href + ')'});        
        // $("#tw-share").attr({"data-hashtags": 'まゆげジェネレータ'});        
        twttr.widgets.load();

        $scope.appendMetaInfo( "og:image", location.protocol + '//' + location.host + '/imgstore/' + remoteFileName + '.png');
        FB.XFBML.parse($('#snsBtn')[0]);
      } else {
        $("#pngArea > img").remove();
        $("#pngArea").append('<img itemprop="image"/>');
      }
      $("#svgArea").svg('destroy');
    })

  }

  $scope.toggleMayugeTypeBoxDisplay = function() {
    if ($scope.conf.showToolBox) {
      $scope.conf.showMayugeTypeBox = true;
    } else {
      if ($scope.conf.faceDetect) {
        $scope.conf.showMayugeTypeBox = true;
      } else {
        $scope.conf.showMayugeTypeBox = false;
      }
    }
  }

  $scope.init = function() {
     // モデルの初期化など
    $scope.conf = {};
    $scope.conf.mayugeType = "golgo";
    $scope.conf.optionsLR = "r";
    $scope.conf.autoSave = false;
    $scope.conf.faceDetect = true;
    $scope.conf.showToolBox = true;
    $scope.conf.changeAllMayugeColor = false;
    $scope.alertboxdata = {};
    $scope.alertboxdata.status = '';
    $scope.alertboxdata.message = '';
    $scope.alertboxdata.show = false;
    $scope.progressbar = {};
    $scope.progressbar.show = false;
    $scope.toggleMayugeTypeBoxDisplay();


    // ツールチップの準備
    // $('[rel=tooltip]:not(#svgArea)').tooltip("show");
    $('[rel=tooltip][data-default-show=true]').tooltip("show");
    $('[rel=tooltip]').tooltip();

    // snsボタン
    gapi.plus.go('snsButtonTop');

    // // まゆ毛の種類ドロップダウン準備
    // $scope.$apply(function($scope){

    //   $('select[name=mayugeType]').EggImageDropdown({
    //     width: 50,
    //     height: 35,
    //     dropdownWidth:50, //幅指定
    //     dropdownHeight:100, //高さ指定
    //     lock:'width'
    //   });
    // });

    // まゆげのいろ変更
    $('select[name="colorpicker4mayuge"]').simplecolorpicker({
      // picker: true
    })//.on('change', $scope.changeMayugeColor);

    // まゆげのりんかくのいろ変更
    $('select[name="colorpicker4rinkaku"]').simplecolorpicker({
      // picker: true
    })//.on('change', $scope.changeRinkakuColor);


    // クリックでアラートボックスを非表示にする
    // $('.alert .close').on('click', function(){
    //     $(this).parent().hide();
    // });




    //ファイル選択時にテキストボックスにパスをコピー
    $('input[id=imageSelector]').change(function() {
         $('#filePath').val($(this).val());
    });

    // ファイル選択時イベントハンドラ
    $("#imageSelector").change(function() {

      // メッセージボックス表示
      $scope.alertboxdata.status = 'info';
      $scope.alertboxdata.message = '画像読込中...数秒〜数十秒かかります...';
      $scope.$apply('alertboxdata.show = true');
      $scope.progressbar.progress = 5;
      $scope.$apply('progressbar.show = true');
      $("#progressbar").show();


      // 選択されたファイルを取得
      var file = this.files[0];
      // $("#imageSelector").val("");
      // $("#filePath").val("");

      // 画像ファイル以外は処理中止
      if (!file || !file.type || !file.type.match(/^image\/(png|jpeg|jpg|gif)$/)) {
        $scope.alertboxdata.status = 'important';
        $scope.alertboxdata.message = 'PNG/JPG/GIFファイルを選択してください。';
        $scope.$apply('alertboxdata.show = true');
        $("#progressbar").fadeOut(1000);
        return;    
      }

      // サーバ側保存済みファイルIDをクリア
      currentFile = null;

      // PNGが表示されていたら非表示に（外部リンクから飛んできた場合）
      $("#pngArea").css("display", "none");

      if ($scope.conf.faceDetect) {
        // アップロード
        $scope.upload();
      }

      // ファイル読み込み
      localImage = new Image();
      var reader = new FileReader();
      // var imageWidth;
      // var imageHeight;

      // File APIを使用し、ローカルファイルを読み込む
      reader.onload = function(evt) {

        // 画像がloadされた後に、canvasに描画する
        localImage.onload = function() {

          selectedImageWidth = localImage.width;
          selectedImageHeight = localImage.height;


          // var limitSize = 400;
          if (selectedImageWidth > limitSize || selectedImageHeight > limitSize) {

            if (selectedImageWidth > selectedImageHeight) {
              selectedImageHeight = Math.round(selectedImageHeight * limitSize / selectedImageWidth);
              selectedImageWidth = limitSize;
            } else if (selectedImageWidth < selectedImageHeight) {
              selectedImageWidth = Math.round(selectedImageWidth * limitSize / selectedImageHeight);
              selectedImageHeight = limitSize;
            } else {
              selectedImageWidth = limitSize;
              selectedImageHeight = limitSize;
            }
          }

          if ($scope.conf.faceDetect) {
          } else {
            // SVG描画
            $scope.getSVG();
          }
          console.timeEnd("");
        }

        // 画像のURLをソースに設定
        localImage.src = evt.target.result;
      }

      // ファイルを読み込み、データをBase64でエンコードされたデータURLにして返す
      reader.readAsDataURL(file);
    });

  }

  // ■引数
  // _type : "og:type" や ”og:title” のような文字列。
  // _value : 設定したい値。<meta> の "content" 属性です。
  $scope.appendMetaInfo = function (_type, _value)    {
      // 既にメタタグがあった場合、2重に追加されてしまうのを避けるため探す
      metatags = document.getElementsByTagName("meta");
      // メタタグ自体なかったらループ処理を飛ばす
      if(metatags.length > 0) {
          for (i = 0; i < metatags.length; i++)    {
              // <meta property=""> が一致したらアップデート
              if ( _type == metatags[i].getAttribute("property") ){
                    metatags[i].content=_value;
                    // 設定したらやることもないので帰る。
                    return true;
              }
          }
      }
      // 引数「_type」に一致するメタ情報がなかった場合は追加。
      var metaObj=document.createElement('meta');
      metaObj.setAttribute('property', _type);
      metaObj.content=_value;
      $("head").append(metaObj);
  }

  $scope.init();

}

// DOMの準備完了時
angular.element(document).ready(function() {window.addEventListener('popstate', function(event) {angular.element('#content').scope().popstate(event);},false );});

