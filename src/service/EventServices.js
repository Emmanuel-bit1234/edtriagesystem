import axios from "axios";
import { NET_IP } from "../config/Config";

export default function EventService() {
    this.getAllEvents = (id) => {
        var url = `${NET_IP}/EventManagement/GetEventsData?EventGroupID=${id}`;
        return axios.get(url).then((response) => response.data.Events);
    };
    this.getAllParentEvents = () => {
        var url = `${NET_IP}/EventManagement/GetParentEvents1`;
        return axios.get(url).then((response) => response.data);
    };
    this.createEvent = (data) => {
        var url = `${NET_IP}/EventManagement/InsertEventGroup`;
        return axios.post(url, data).then((response) => response.data);
    };
    this.deActivateEvent = (id) => {
        var url = `${NET_IP}/EventManagement/DeleteEvent?id=${id}`;
        return axios.post(url).then((response) => response.data);
    };
}
