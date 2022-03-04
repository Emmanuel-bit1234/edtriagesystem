import axios from "axios";
import { NET_IP } from "../config/Config";

export default function EventCategoryService() {
    this.getAllEventCategories = (id) => {
        var url = `${NET_IP}/EventManagement/GetEventCategory`;
        return axios.get(url).then((response) => response.data);
    };
}
