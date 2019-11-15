
  $(document).ready(function(){
    var socket , type , params , page
    var $currentPage = $('.currentPage')
    var $totalPage = $('.totalPage')
    var init = function(){
      initData()
      initSocket()
      initFrame()
      initControl()
    }
    // 初始一些默认数据
    var initData = function(){
      params = new URLSearchParams(window.location.search.substring(1));
      if(params.get("type") === 'teacher'){
        type = 'teacher'
      }else{
        type = 'student'
      }

    }
    // 实例socket
    var initSocket = function(){
        socket = io("ws://localhost:8001/")
        socketDescribe()
    }
    // socket订阅事件
    var socketDescribe = function(){
      socket.on('receive',function(data){
        if(data.type==='teacher'){
            window.frames[0].frame.restore(data.page)  
        }
      })
    }
    // 初始化ppt控件
    var initShowBar = function(){
      if(window.frames[0].frame){
        $totalPage.text(window.frames[0].frame.getTotalSlides())
        $currentPage.text(window.frames[0].frame.getIndex())
        window.frames[0].frame.disableTouch()
      }
    }
    var initFrame = function(){
      var iframe = document.getElementById("ppt");    
      if (iframe.attachEvent) {    
          iframe.attachEvent("onload", function() {    
              //iframe加载完成后你需要进行的操作  
              initShowBar()
          });   
          
      } else {    
          iframe.onload = function() {    
              //iframe加载完成后你需要进行的操作  
              initShowBar()
          };    
      }    

    }
    var initControl = function(){
      var _defaultEmit = function(){
        socket.emit('change',{
          page:window.frames[0].frame.snapshot(),
          type:type
        })
      } 
      // 上一页
      $('#prevSlide').on('click',function(){
          window.frames[0].frame.prevSlide()
          _defaultEmit()
        })
      // 下一页
      $('#nextSlide').on('click',function(){
          window.frames[0].frame.nextSlide()
          _defaultEmit()
        })
      $('#pause').on('click',function(){
          window.frames[0].frame.pause()
        })
      $('#resume').on('click',function(){
          window.frames[0].frame.resume()
          socket.emit('change',{
            page:window.frames[0].frame.snapshot(),
            type:type
          })
        })
      // 下一步

      $('#forward2').on('click',function(){
        // window.frames[0].frame.trackAction(function(event, action, index, id){
        //   console.log(event, action, index, id)
        //   //broadcast是通信接口，需要自己实现
        // })
       window.frames[0].frame.forward2()
        socket.emit('change',{
          page:window.frames[0].frame.snapshot(),
          type:type
        })
      })
      // 上一步

      $('#backward2').on('click',function(){
        
          window.frames[0].frame.backward2()
          _defaultEmit()
        })
      $('#disableTouch').on('click',function(){
          window.frames[0].frame.disableTouch()
        })
      $('#enableTouch').on('click',function(){
          console.log(window.frames[0].frame.enableTouch())
          window.frames[0].frame.enableTouch()
        })
      $('#snapshot').on('click',function(){
          console.log(window.frames[0].frame.snapshot())
        })
    }

    init() 
  })
