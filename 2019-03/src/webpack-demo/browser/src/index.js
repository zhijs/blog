import {add, decrease} from './util/index'
import {findDom} from './util/dom'
import log, {helloLog} from './util/log'

let dom = findDom('#app')
dom.innerText = add(4,3) *　decrease(4, 3);
log('export default log')
helloLog('export real name')
