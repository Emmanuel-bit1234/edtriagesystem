import axios from "axios";
import { NET_IP } from "../config/Config";

export default function EventService() {
    this.getAllEvents = (id) => {
        var url = `${NET_IP}/EventManagement/GetEventType?id=${id}`;
        return axios.get(url).then((response) => response.data);
    };
    this.createEvent = (data) => {
        var url = `${NET_IP}/EventManagement/InsertEventGroup`;
        return axios.post(url, data).then((response) => response.data);
    };
    this.deActivateEvent = (id) => {
        var url = `${NET_IP}/EventManagement/GetEventType/${id}`;
        return axios.get(url).then((response) => response.data);
    };
    this.activateEvent = (id) => {
        var url = `${NET_IP}/EventManagement/GetEventTypex/${id}`;
        return axios.get(url).then((response) => response.data);
    };
}
