import axios from 'axios'
import { NET_IP } from '../config/Config'

export default function ObjectionsService() {
  this.getAllObjectionType = () => {
    var url = `${NET_IP}/DataInspection/GetObjectionTypes1`
    return axios.get(url).then((response) => response.data)
  };
  this.getObjectionsByID = (ID) => {
    var url = `${NET_IP}/DataInspection/GetObjectionsByRegistrationNo?regNo=${ID}`
    return axios.get(url).then((response) => response.data.Objections)
  };
  this.getObjectionsByTypeStatusAndEvent = (id) => {
    var url = `${NET_IP}/DataInspection/GetObjections?ObjectionTypeID=${id}&ObjectionStatusID=null&EventID=null`
    return axios.get(url).then((response) => response.data.Objections)
  };
  this.createObjection = (data) => {
      var url = `${NET_IP}/DataInspection/InsertObjection`;
      return axios.post(url, data).then((response) => response.data);
  };
}
