class Util {
public:
    static double to_d(mValue value) {
        if (value.type() == int_type) {
            return (double)value.get_int();
        } else {
            return value.get_real();
        }
    }
};
