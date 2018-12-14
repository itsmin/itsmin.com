// TOUCH CONTROLS
document.addEventListener("touchstart", function(){}, true);

// HEADER CONTROLS
$(function headerControls() {
  // App Drawer toggle
  $(".icon_menu").click(function() {
    $(".app_panel").toggleClass('app_panel_open');
    $(".app_panel_close").toggleClass('app_panel_close_hidden');
  });
  $(".app_panel_close").click(function() {
    $(".app_panel").toggleClass('app_panel_open');
    $(".app_panel_close").toggleClass('app_panel_close_hidden'); // click outside panel trigger
  });


  // search toggle
  $(".icon_search").click(function() {
    if($('.notifications').hasClass('notifications_open')) {
      $('.notifications').removeClass('notifications_open');
      $(".search_results").toggleClass('search_results_open');
    } else {
      $(".search_results").toggleClass('search_results_open');
    }
    if($('.app_panel').hasClass('app_panel_open')) {
      $('.app_panel').removeClass('app_panel_open');
      $(".app_panel_close").toggleClass('app_panel_close_hidden'); // click outside panel trigger
    }
  });
  // Notifications toggle
  $(".icon_notification").click(function() {
    if($('.search_results').hasClass('search_results_open')) {
      $('.search_results').removeClass('search_results_open');
      $(".notifications").toggleClass('notifications_open');
    } else {
      $(".notifications").toggleClass('notifications_open');
    }
    if($('.app_panel').hasClass('app_panel_open')) {
      $('.app_panel').removeClass('app_panel_open');
      $(".app_panel_close").toggleClass('app_panel_close_hidden'); // click outside panel trigger
    }
  });

  // Color Theme toggle
  $(".icon_profile").click(function() {
    $('#container').toggleClass('theme-px-dark theme-px-light');
  });
});

// NOTIFICATION POP UP
$(function notificationPopup() {
  // Notification Pop toggle
  $(".production-over-time").click(function() {
    if($('.notification_pop').hasClass('notification_pop_open')) {
      $('.notification_pop').removeClass('notification_pop_open','notification_pop_dismiss');
    } else {
      $('.notification_pop').addClass('notification_pop_open').removeClass('notification_pop_dismiss');
      $('.notification_count').delay(2500).addClass('count_plus_1');
    }
  });
  // Notification dismiss
  $('.notification_dismiss').click(function() {
    $('.notification_pop').addClass('notification_pop_dismiss');
  });
  // Notification View Details
  $(".notifications_pop_details").click(function() {
    if($('.notifications').hasClass('notifications_open')) {
      $('.notifications').removeClass('notifications_open');
    } else {
      $('.notification_pop').addClass('notification_pop_dismiss');
      $('.notifications').addClass('notifications_open');
      $('.notification_specific').addClass('list_row_clicked');
    }
  });
});


// NUMBER INCREMENT
$(function numberIncrement() {
  $('.count').each(function () {
      $(this).prop('Counter',0).animate({
          Counter: $(this).text()
      }, {
          duration: 2000,
          easing: 'swing',
          step: function (now) {
              $(this).text(Math.ceil(now));
          }
      });
  });
});


// PEEK CONTROLS
// $(function peekControl() {
//   $('.list_row').click(function() {
//     if($(this).hasClass('list_row_clicked')) {
//       $(this).removeClass('list_row_clicked').siblings().removeClass('list_row_faded');
//     } else {
//       $(this).addClass('list_row_clicked').removeClass('list_row_faded').siblings().removeClass('list_row_clicked').addClass('list_row_faded');
//     }
//   });
// });

// TWITTER TYPEAHEAD
// $(document).ready(function () {
//
//   var substringMatcher = function (strs) {
//     return function findMatches(q, cb) {
//       var matches, substringRegex;
//
//       // an array that will be populated with substring matches
//       matches = [];
//
//       // regex used to determine if a string contains the substring `q`
//       substrRegex = new RegExp(q, 'i');
//
//       // iterate through the pool of strings and for any string that
//       // contains the substring `q`, add it to the `matches` array
//       $.each(strs, function (i, str) {
//         if (substrRegex.test(str)) {
//           // the typeahead jQuery plugin expects suggestions to a
//           // JavaScript object, refer to typeahead docs for more info
//           matches.push({
//             value: str
//           });
//         }
//       });
//
//       cb(matches);
//     };
//   };
//
//   var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
//     'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
//     'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
//     'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
//     'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
//     'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
//     'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
//     'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
//     'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
//   ];
//
//   $('#the-basics .typeahead').typeahead({
//       hint: true,
//       highlight: true,
//       minLength: 1
//   }, {
//       name: 'states',
//       displayKey: 'value',
//       source: substringMatcher(states)
//   });
// });
