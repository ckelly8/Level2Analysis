function computeCOM(array, size = null){
        // Formula for center of mass for linear mass with discrete masses 
        // at known positions is: X_cm = sum(m_i*x_i) / sum(m_i)

        // if no parameter is passed use full orderbook size
        if(size == null){
            size = array.length;
        }

        let mi = 0;
        let xi = 0;
        let sum_mi = 0;
        let sum_mi_xi = 0;
        let COM = 0;

        for(let i = 0; i < size; i++){
            xi = array[i][0];
            mi = array[i][1];
            sum_mi += mi;
            sum_mi_xi += mi*xi;
        }

        COM = (sum_mi_xi / sum_mi);

        return COM;

    }

module.exports = { computeCOM };