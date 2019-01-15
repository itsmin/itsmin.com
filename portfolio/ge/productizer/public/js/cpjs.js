<script>
  // detail lightbox
  $(function() {
    $("a.detail_toggle").click(function() {
      $(".detail_view").toggleClass('detail_open');
    });
  });
  $(function() {
    $(".detail_view").click(function() {
      $(this).toggleClass('detail_open');
    });
  });

  // pie chart scroll table
  jQuery.easing.def = 'easeOutQuad';
  $(function() {
    $("#inv_pie_arl_none, .arl_0").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_0');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
    $("#inv_pie_arl_1, .arl_1").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_1');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
    $("#inv_pie_arl_2, .arl_2").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_2');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
    $("#inv_pie_arl_3, .arl_3").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_3');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
    $("#inv_pie_arl_4, .arl_4").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_4');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
    $("#inv_pie_arl_5, .arl_5").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_5');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
    $("#inv_pie_arl_6, .arl_6").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_6');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
    $("#inv_pie_arl_7, .arl_7").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_7');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
    $("#inv_pie_arl_8, .arl_8").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_8');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
    $("#inv_pie_arl_9, .arl_9").click(function() {
      var container = $(".dt_body"), scrollTo = $('#dt_row_arl_9');
      container.animate ({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
      }, 900);
    });
  });

  // chevron rotation
  $(function() {
    $(".dt_hd_cell").click(function() {
      $(this).find("a").toggleClass('chevron_rotated');
    });
  });

  // expanding row handler
  $(function() {
    $(".dt_row").click(function() {
      if($(this).hasClass('dt_row_clicked')) {
        $(this).removeClass('dt_row_clicked').siblings().removeClass('dt_row_faded');
      } else {
        $(this).addClass('dt_row_clicked').removeClass('dt_row_faded').siblings().removeClass('dt_row_clicked').addClass('dt_row_faded');
      }
    });
  });

</script>
