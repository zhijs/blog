import {add, decrease} from './util/index'
import {findDom} from './util/dom'

let dom = findDom('#app')
dom.innerText = add(4,3) *　decrease(4, 3);
