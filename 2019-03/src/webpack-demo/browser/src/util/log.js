import {domHello } from './dom'
export default function log(str) {
  console.log(str)
}
export function helloLog (str) {
  domHello()
  console.log('log helloLog', str) 
}