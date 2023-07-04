const labelStyle = {
  color: '#8E97A6',
  fontSize: '12px',
  fontFamily: "Graphik"
};

const dataLabelStyle = {
  fontSize: '12px',
  fontWeight: 'normal',
  fontFamily: "Graphik"
};


export default {
  options: {
    title: undefined,
    credits: {
      enabled: false
    },
    colors: ['#7344C0', '#C96DD8', '#3023AE'],
    chart: {
      style: {
        fontFamily: "Graphik"
      }
    },
    plotOptions: {
      bar: {
        dataLabels: {
          style: dataLabelStyle
        }
      }
    },
    legend: {
      itemStyle: {
        fontWeight: 'normal',
        color: '#43516B',
        fontSize: '14px',
        fontFamily: "Graphik"
      }
    },
    xAxis: {
      labels: {
        style: labelStyle,
      },
    },
    yAxis: {
      labels: {
        style: labelStyle,
      },
    },
  },
};
