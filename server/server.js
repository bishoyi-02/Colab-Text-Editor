
const mongoose = require('mongoose')
const Document = require('./document')

const io=require('socket.io')(3001,{
    cors:{
        origin:'http://localhost:3000',
        methods:['GET','POST']
    }
})

mongoose.connect('mongodb://localhost/google-docs-clone',{
    useNewURLParser:true,
    useUnifiedTopology:true,
})

const defaultValue=""

io.on('connection',socket=>{
    socket.on('get-document',documentId=>{
        const document=findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document',document.data)
        socket.on('send-changes',delta=>{
            // console.log(delta)
            socket.broadcast.to(documentId).emit('recieve-changes',delta)
        })
        socket.on('save-document',async data=>{
            await Document.findByIdAndUpdate(documentId,{data})
        })
    })
    console.log('connected')
})

async function findOrCreateDocument(id){
    if(id==null)return
    // console.log(id)
    const document=await Document.findById(id)
    if(document)return document
    return await Document.create({_id:id,data:defaultValue})
}