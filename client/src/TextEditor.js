import React, { useEffect, useRef, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import {io} from  'socket.io-client'
import {useParams} from 'react-router-dom'

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
]
const SAVE_INTERVAL_MS=2000


export default function TextEditor() {
    const wrapperRef = useRef()
    const [socket,setSocket]=useState()
    const [quill,setQuill]=useState()
    const {id:documentId}= useParams()
    // console.log(useParams())

    useEffect(() => {
      if(socket==null || quill==null)return
      const interval =setInterval(() => {
        socket.emit('save-document',quill.getContents())
      }, SAVE_INTERVAL_MS);
      return()=>{
        clearInterval(interval)
      }
    }, [socket,quill])
    

    useEffect(()=>{
        const s=io("http://localhost:3001")
        setSocket(s)
        const editor = document.createElement('div')
        wrapperRef.current.append(editor)
        const q=new Quill(editor,{theme:"snow",modules:{toolbar:TOOLBAR_OPTIONS}})
        setQuill(q)
        q.enable(false)
        q.setText('Loading...')
        return()=>{
            // console.log("JI")
            s.disconnect()
            wrapperRef.current.innerHTML=""
        }
    },[])

    useEffect(() => {
      if(socket==null || quill==null)return
      socket.once('load-document',document=>{
        quill.setContents(document)
        quill.enable()
      })
      socket.emit('get-document',documentId)
    }, [socket,quill,documentId])
    

    useEffect(()=>{
        if(socket==null || quill==null)return
        const handler=(delta,oldDelta,source)=>{
            if(source!=='user')return
            socket.emit('send-changes',delta)
        }
        quill.on('text-change',handler)
        return()=>{
            quill.off('text-change',handler)
        }
    },[socket,quill])

    useEffect(()=>{
        if(socket==null || quill==null)return
        const handler=(delta)=>{
            quill.updateContents(delta)
        }
        socket.on('recieve-changes',handler)
        return()=>{
            socket.off('recieve-changes',handler)
        }
    },[socket,quill])

  return (
    <div className="container" ref={wrapperRef}></div>
  )
}
