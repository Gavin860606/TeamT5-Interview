import EventEmitter from 'events'
const emitter = new EventEmitter()
//防止沒有catch到err，也作為監聽
emitter.on('uncaughtException', function (err) {
    console.error(err)
})

export default emitter
