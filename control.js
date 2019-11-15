
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
          if(data.isSamePage){
            window.frames[0].frame.forward2()
          }else{
            window.frames[0].frame.restore(data.page)
          }
        }
        if(data.isSamePage){
          console.log('samepages')
          window.frames[0].frame.forward2()
        }
      })
    }
    // 初始化ppt控件
    var initShowBar = function(){
      if(window.frames[0].frame){
        $totalPage.text(window.frames[0].frame.getTotalSlides())
        $currentPage.text(window.frames[0].frame.getIndex())
        window.frames[0].frame.disableTouch()

        // window.frames[0].frame.trackAction(function(event, action, index, id){
        //   socket.emit('change',{
        //     page:window.frames[0].frame.snapshot(),
        //     type:type
        //   })
        // })
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
      var _defaultEmit = function(isSamePage){
        page = window.frames[0].frame.snapshot()
        socket.emit('change',{
          page:window.frames[0].frame.snapshot(),
          type:type,
          isSamePage:isSamePage||false
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
        })
      // 下一步

      $('#forward2').on('click',function(){
         console.log(window.frames[0].frame.snapshot(),'new')
         window.frames[0].frame.pause()
         if(window.frames[0].frame.snapshot() !== page){
           window.frames[0].frame.forward2()
            _defaultEmit()
         }else{
            _defaultEmit(true)
         }
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
