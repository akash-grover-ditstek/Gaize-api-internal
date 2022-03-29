import organizationController from "./organization.controller.js";
import PaymentController from "./payment.controller.js";
import StripeController from "./stripe.controller.js";
import UserController from "./user.controller.js";
import LogController from "./logs.controller.js";


class Controller  {
    constructor(){
        this.user = new UserController(this);
        this.organization = new organizationController(this);
        this.stripe = new StripeController(this);
        this.payment = new PaymentController(this);
        this.log = new LogController(this);

    }
}
export default new Controller()