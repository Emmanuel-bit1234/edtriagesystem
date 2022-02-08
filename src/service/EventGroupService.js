import axios from "axios";
import { NET_IP } from "../config/Config";

export default function EventGroupService() {
    this.getAllEventGroups = () => {
        var url = `${NET_IP}/EventManagement/EventGroupIndex`;
        return axios.get(url).then((response) => response.data);
    };
    this.deActivateEventGroup = (id) => {
        var url = `${NET_IP}/EventManagement/EventGroupIndex/${id}`;
        return axios.get(url).then((response) => response.data);
    };
    this.activateEventGroup = (id) => {
        var url = `${NET_IP}/EventManagement/EventGroupIndex/${id}`;
        return axios.get(url).then((response) => response.data);
    };
}
