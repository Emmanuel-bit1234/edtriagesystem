import axios from 'axios'
import { NET_IP } from '../config/Config'

export default function ObjectionsService() {
  this.getAllObjections = () => {
    var url = `${NET_IP}/DataInspection/GetObjections?regNo=DCON00000093`
    return axios.get(url).then((response) => response.data.Objections)
  }
  this.getObjectionsByID = (ID) => {
    var url = `${NET_IP}/DataInspection/GetObjections?regNo=${ID}`
    return axios.get(url).then((response) => response.data.Objections)
  }
  // this.createObjection = (data) => {
  //     var url = `${NET_IP}/DataInspection/InsertObjection`;
  //     return axios.post(url, data).then((response) => response.data);
  // };
}
