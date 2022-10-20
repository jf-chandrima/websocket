
let prevObj={};
let currentSnapshot = [];
let editor =null;
let socket=null; 

let id = sessionStorage.getItem("id");
socket = io('ws://localhost:8080?id='+id);

tinymce.init({
    selector: '#mytextarea',
    valid_elements: "@[id|unique_id|class|title|style|data-options|data*]," +
    "a[name|href|target|title]," +
    "#p,-ol,-ul,-li,br,img[src|height|width],-b,-i,-u," +
    "-span[data-mce-type],hr",
    setup: function(ed){
      editor=ed;  
        ed.on('keyup',function(e){   
        if ( 13 === e.keyCode ) {
          e.preventDefault();
          let changedNodeName = tinymce.activeEditor.selection.getNode().nodeName
           let  dupEle  = $(tinymce.activeEditor.selection.getNode()).closest(changedNodeName);
           dupEle.removeAttr('class');
           tinymce.activeEditor.dom.addClass(dupEle , uniqueid());
           var myContent = tinymce.activeEditor.getContent();
           let enterobj = {type:'',content:''}
          
          //  console.log(myContent);
           myContent= myContent.replace('&nbsp;','')
           enterobj.content = myContent;
           enterobj.type = 13
           socket.emit('message',enterobj)
        }
        range = tinymce.activeEditor.selection.getRng();
        let endOffset = range['endOffset'];
        let context = range['startContainer']['data'];
        let nodeName = tinymce.activeEditor.selection.getNode().nodeName;
        let className = tinymce.activeEditor.selection.getNode().getAttribute('class');
    
        if(tinymce.activeEditor.selection.getNode().getAttribute('class')){
          
           let customSelector = nodeName+'.'+className; 
           let obj = {
            id:'',
            content:'',
           }
           obj.id = customSelector;
           obj.content = context;
           //send information to other users     
           socket.emit('message',obj);   
        }        
        });  
        
    }
  });

  socket.on('message',obj => {
    
    if(obj.type && obj.type==13){  
     editor.setContent(obj.content);
    }
    
    if(this.prevObj==null){
      this.prevObj = obj;
    }  
    if(this.prevObj.id!=obj.id){
      userCursor ='';

      if(!obj.content){
        obj.content = ''
      }
      editor.dom.setHTML(tinymce.activeEditor.dom.select(this.prevObj.id),this.prevObj.content);  
      this.prevObj = obj;
    } else if(this.prevObj.id==obj.id){
      this.prevObj.content = obj.content;
    }
      let color = 'red';
      userCursor = `<a contentEditable="false" style="color: ${color}">|<a contentEditable="false" style="color: ${color}; position:relative; top: -13px;
      right: 2px;font-size: 14px;">${obj.client}</a></a>`;
      let content = obj.content+userCursor;

      if(!obj.content){
        obj.content = ''
      }
      editor.dom.setHTML(tinymce.activeEditor.dom.select(obj.id),content); 
    });  
    
    
    //Generate unique id
    
    function uniqueid(){
      // always start with a letter (for DOM friendlyness)
      var idstr=String.fromCharCode(Math.floor((Math.random()*25)+65));
      do {                
          // between numbers and characters (48 is 0 and 90 is Z (42-48 = 90)
          var ascicode=Math.floor((Math.random()*42)+48);
          if (ascicode<58 || ascicode>64){
              // exclude all chars between : (58) and @ (64)
              idstr+=String.fromCharCode(ascicode);    
          }                
      } while (idstr.length<32);
  
      return (idstr);
  }
  