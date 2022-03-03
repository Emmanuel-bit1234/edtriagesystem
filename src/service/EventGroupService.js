import axios from 'axios'
import { NET_IP } from '../config/Config'

export default function EventGroupService() {
  this.deActivateEventGroup = (id, reason) => {
    var url = `${NET_IP}/EventManagement/DeleteEventGroup?id=${id}&StatusReason=${reason}`
    return axios.get(url).then((response) => response.data)
  }
  this.getAllEventGroups = () => {
    var url = `${NET_IP}/EventManagement/EventGroupIndex`
    return axios.get(url).then((response) => response.data.EventGroups)
  }
  this.createEventGroup = (data) => {
    let config = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With',
      },
    }
    var url = `${NET_IP}/EventManagement/InsertEventGroup`
    return axios.post(url, data,config).then((response) => response.data)
  }
  // this.deActivateEventGroup = (id) => {
  //     var url = `${NET_IP}/EventManagement/EventGroupIndex/${id}`;
  //     return axios.get(url).then((response) => response.data);
  // };
  // this.activateEventGroup = (id) => {
  //     var url = `${NET_IP}/EventManagement/EventGroupIndex/${id}`;
  //     return axios.get(url).then((response) => response.data);
  // };
}
