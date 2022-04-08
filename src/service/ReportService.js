import axios from 'axios'
import { LOCALHOST_NET_IP } from '../config/Config'

export default function () {
    
  this.getReport = (data) => {
    var url = `${LOCALHOST_NET_IP}/report/get`
    return axios
      .post(url, data)
      .then((response) => response.data)
  }
}
