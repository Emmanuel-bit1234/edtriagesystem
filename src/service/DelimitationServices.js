import axios from 'axios'
import { MICRO_SERVICE_IP } from '../config/Config'

export default function DelimitationServices() {
  this.getAllDistrict = () => {
    var url = `${MICRO_SERVICE_IP}/api/open/delimitation/national/district`
    return axios.get(url).then((response) => response.data)
  }
  this.getConstituency = (id) => {
    var url = `${MICRO_SERVICE_IP}/api/open/delimitation/national/constituency/${id}`
    return axios.get(url).then((response) => response.data)
  }
  this.pollingDivision = (id) => {
    var url = `${MICRO_SERVICE_IP}/api/open/delimitation/national/pollingDivision/constituency/${id}`
    return axios.get(url).then((response) => response.data)
  }

  this.registrationCentre = (id) => {
    var url = `${MICRO_SERVICE_IP}/api/open/delimitation/national/registrationCentre/pollingDivision/${id}`
    return axios.get(url).then((response) => response.data)
  }

  this.getVillage = (id) => {
    var url = `${MICRO_SERVICE_IP}/api/open/delimitation/national/village/${id}`
    return axios.get(url).then((response) => response.data)
  }
  
 
}

