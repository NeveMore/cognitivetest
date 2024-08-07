
// Fastclick - disable click delay
new FastClick(document.body);

// prevent bounce effect
document.ontouchmove = function(event){
  event.preventDefault();
};

// Ember App

App = Ember.Application.create();

App.Router.map(function() {
  this.route('intro');
  this.route('pre');
  this.route('test');
  this.route('result');
});

App.IndexRoute = Em.Route.extend({
  redirect: function() {
    this.transitionTo('intro');
  }
});

App.IntroRoute = Em.Route.extend({
  model: function() {
    return this.store.find('corsi', 1);
  }
});

App.PreRoute = Em.Route.extend({
  model: function() {
    return this.store.find('corsi', 1);
  }
});

App.TestRoute = Em.Route.extend({
  model: function() {
    return this.store.find('corsi', 1);
  }
});

App.ResultRoute = Em.Route.extend({
  model: function() {
    return this.store.find('corsi', 1);
  }
});

App.IntroView = Em.View.extend({
  didInsertElement: function() {
    // reset test properties
    var controller = this.get('controller');
    controller.setProperties({
      'level': 1,
      'clicks': 0,
      'tapErrors': 0,
      'errCount': 0
    });
  },
  touchEnd: function(evt) {
    if(evt.target.nodeName === 'BUTTON') this.get('controller').transitionToRoute('pre');
  },
  click: function(evt) {
    if(evt.target.nodeName === 'BUTTON') this.get('controller').transitionToRoute('pre');
  }
});

App.PreView = Em.View.extend({
  didInsertElement: function() {
    var level = this.get('controller.level');

    var counter = 1;
    while (level >= counter) {
      this.$('#small-btn-' + counter).addClass('btn-flash');
      counter += 1;
    }
  },
  willDestroyElement: function() {
    this.$('.small-btns').find('.btn').removeClass('btn-flash');
  },
  touchEnd: function(evt) {
    if(evt.target.nodeName === 'BUTTON') this.get('controller').transitionToRoute('test');
  },
  click: function(evt) {
    if(evt.target.nodeName === 'BUTTON') this.get('controller').transitionToRoute('test');
  }
});

App.ResultView = Em.View.extend({
  didInsertElement: function() {
    this.set('controller.level', this.get('controller.level') - 1);
  },
  touchEnd: function(evt) {
    if(evt.target.nodeName === 'BUTTON')  {
      // Get the level from the controller
      var level = this.get('controller.level');

      // Create the content string with the level
      var content = '您的测试结果是: ' + level + ' 级';

      // Create a blob with the content of the text file
      var textBlob = new Blob([content], { type: 'text/plain' });

      // Create a link element
      var downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(textBlob);
      downloadLink.download = 'corsi-result.txt';

      // Hide the link and trigger the download
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Remove the link after triggering the download
      document.body.removeChild(downloadLink);
    }
  },
  click: function(evt) {
    if(evt.target.nodeName === 'BUTTON') {
      // Get the level from the controller
      var level = this.get('controller.level');

      // Create the content string with the level
      var content = '您的测试结果是: ' + level + ' 级';

      // Create a blob with the content of the text file
      var textBlob = new Blob([content], { type: 'text/plain' });

      // Create a link element
      var downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(textBlob);
      downloadLink.download = 'corsi-result.txt';

      // Hide the link and trigger the download
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Remove the link after triggering the download
      document.body.removeChild(downloadLink);
    }
  }
});

App.TestView = Em.View.extend({
  previousTouchId: 0, // to ignore multiple events on same box
  willDestroyElement: function() {
    var controller = this.get('controller');
    controller.setProperties({
      'clicks': 0,
      'tapErrors': 0
    });

    this.set('previousTouchId', 0);

    this.$('.test-btns').toggleClass('animation play');
    this.$('.btn').removeClass('btn-flash-show btn-flash btn-danger');
    this.$('.message').empty();
  },
  didInsertElement: function() {
    // set elements to  canvas
    this.setElements();
  },
  setElements: function() {
    var that = this;
    // shuffle arrays then pick up the first grid and shuffle its positions.
    var positions = _.shuffle(_.first(_.shuffle(randomGrids)));

    that.$('.test-btns').addClass('animation');
    that.$('.screen').removeClass('hidden');

    positions.forEach(function(position, index) {
      that.$('#btn-' + (index + 1)).css({
        'left': position.left,
        'top': position.top,
        'visibility': 'visible'
      });
    });

    // when elements are in position start animation with small delay
    Ember.run.next(function() {
      setTimeout(function() {
        that.flashElements();
      }, 500);
    });
  },
  flashElements: function() {
    var level = this.get('controller').get('level'),
      iteration = 1,
      that = this;

    $('.message').html('等待并观察哪些方块被点亮。');

    var flashInterval = setInterval(function() {
      var $btn = that.$('#btn-' + iteration);

      $btn.addClass('btn-flash');
      setTimeout(function() {
        $btn.removeClass('btn-flash');
      }, 1300);

      if (iteration >= level) {
        clearInterval(flashInterval);
        setTimeout(function() {
          that.$('.test-btns').toggleClass('animation play');
          that.$('.screen').addClass('hidden');
          $('.message').html('按相同的顺序点亮刚才依次亮起的方块。');
        }, 2000);
      }

      iteration += 1;
    }, 2500);
  },
  touchEnd: function(evt) {
    this.eventChannel(evt);
  },
  click: function(evt) {
    this.eventChannel(evt);
  },
  eventChannel: function(evt) {
    var $tgt = $(evt.target),
      controller = this.get('controller'),
      blockId = $tgt.text();

    // not a button or too many clicks
    if (evt.target.nodeName != 'BUTTON' || (controller.get('clicks') + 1) > controller.get('level')) return false;
    // if same as previous
    if(blockId == this.get('previousTouchId')) return false;
    // set history
    this.set('previousTouchId', blockId);
    // register click
    controller.set('clicks', controller.get('clicks') + 1);

    this.testEvent(blockId);
  },
  testEvent: function(value) {
    var that = this,
      counter = 1;

    var controller = that.get('controller'),
      clicks = controller.get('clicks'),
      level = controller.get('level'),
      tapErrors = controller.get('tapErrors'),
      errCount = controller.get('errCount');

    if (clicks != value) { // if false answer increment error count
      controller.set('tapErrors', tapErrors + 1);
      that.$('#btn-' + clicks).addClass('error'); // add error marker
    }

    if (clicks >= level) {
      // highlight elements
      counter = 1;
      while (level >= counter) {
        that.$('#btn-' + counter).addClass('btn-flash-show');
        counter += 1;
      }
      // highlight errors
      that.$('.error').toggleClass('error btn-danger');

      if (controller.get('tapErrors') === 0) {
        $('.message').html('您的按键反应正确。');
      } else if (controller.get('errCount') === 0) {
        $('.message').html('您的按键反应不正确。请再尝试一次。');
      } else {
        $('.message').html('您的按键反应不正确。测试结束。');
      }

      setTimeout(function() {
        if (controller.get('tapErrors') === 0) {
          controller.set('errCount', 0);
          controller.set('level', level + 1);
        } else {
          errCount += 1;
          controller.set('errCount', errCount);
        }

        if (errCount > 1 || controller.get('level') >= 10) {
          controller.transitionToRoute('result');
        } else {
          controller.transitionToRoute('pre');
        }

      }, 4000);

    }
  }
});

// Helpers

Em.Handlebars.registerBoundHelper('multiply', function(count, word) {
  return (count > 1) ? word + 'ta' : word;
});

// Model

App.ApplicationAdapter = DS.FixtureAdapter;

App.Corsi = DS.Model.extend({
  level: DS.attr('number'),
  clicks: DS.attr('number'),
  tapErrors: DS.attr('number'),
  errCount: DS.attr('number')
});

App.Corsi.FIXTURES = [{
  id: 1,
  level: 1,
  clicks: 0,
  tapErrors: 0,
  errCount: 0
}];

// Random bits

var randomGrids = [
  [{"top":68,"left":43},{"top":391,"left":298},{"top":32,"left":299},{"top":19,"left":628},{"top":188,"left":562},{"top":360,"left":56},{"top":214,"left":211},{"top":227,"left":389},{"top":370,"left":614}],
  [{"top":28,"left":378},{"top":259,"left":228},{"top":40,"left":129},{"top":68,"left":570},{"top":376,"left":449},{"top":360,"left":56},{"top":201,"left":56},{"top":199,"left":395},{"top":251,"left":618}],
  [{"top":30,"left":323},{"top":212,"left":200},{"top":24,"left":75},{"top":35,"left":599},{"top":333,"left":381},{"top":360,"left":56},{"top":372,"left":530},{"top":174,"left":414},{"top":224,"left":597}],
  [{"top":20,"left":406},{"top":190,"left":238},{"top":24,"left":75},{"top":32,"left":632},{"top":335,"left":261},{"top":360,"left":56},{"top":380,"left":470},{"top":166,"left":447},{"top":234,"left":592}],
  [{"top":182,"left":173},{"top":24,"left":224},{"top":24,"left":75},{"top":394,"left":123},{"top":335,"left":261},{"top":26,"left":447},{"top":374,"left":499},{"top":166,"left":447},{"top":234,"left":592}],

  [{"top":160,"left":211},{"top":27,"left":383},{"top":24,"left":75},{"top":394,"left":123},{"top":306,"left":312},{"top":91,"left":591},{"top":374,"left":499},{"top":167,"left":452},{"top":234,"left":592}],
  [{"top":179,"left":202},{"top":14,"left":347},{"top":27,"left":642},{"top":382,"left":137},{"top":329,"left":282},{"top":245,"left":61},{"top":381,"left":499},{"top":156,"left":453},{"top":240,"left":595}],
  [{"top":160,"left":293},{"top":16,"left":165},{"top":390,"left":648},{"top":382,"left":137},{"top":329,"left":282},{"top":166,"left":80},{"top":349,"left":472},{"top":113,"left":453},{"top":226,"left":618}],
  [{"top":106,"left":201},{"top":22,"left":381},{"top":381,"left":620},{"top":404,"left":405},{"top":344,"left":219},{"top":157,"left":42},{"top":397,"left":33},{"top":30,"left":615},{"top":195,"left":532}],
  [{"top":102,"left":204},{"top":250,"left":218},{"top":381,"left":620},{"top":204,"left":501},{"top":209,"left":359},{"top":22,"left":384},{"top":362,"left":386},{"top":30,"left":615},{"top":195,"left":32}],

  [{"top":85,"left":217},{"top":372,"left":91},{"top":313,"left":615},{"top":182,"left":35},{"top":230,"left":255},{"top":22,"left":384},{"top":391,"left":367},{"top":102,"left":599},{"top":207,"left":443}],
  [{"top":50,"left":231},{"top":397,"left":248},{"top":352,"left":614},{"top":27,"left":45},{"top":328,"left":82},{"top":22,"left":384},{"top":388,"left":441},{"top":137,"left":545},{"top":207,"left":391}],
  [{"top":50,"left":231},{"top":397,"left":248},{"top":352,"left":614},{"top":52,"left":66},{"top":328,"left":82},{"top":232,"left":250},{"top":347,"left":440},{"top":188,"left":535},{"top":43,"left":636}],
  [{"top":151,"left":217},{"top":377,"left":257},{"top":42,"left":394},{"top":377,"left":631},{"top":309,"left":81},{"top":191,"left":374},{"top":347,"left":440},{"top":188,"left":535},{"top":43,"left":636}],
  [{"top":46,"left":63},{"top":352,"left":105},{"top":23,"left":474},{"top":354,"left":624},{"top":201,"left":129},{"top":176,"left":323},{"top":329,"left":281},{"top":188,"left":497},{"top":66,"left":652}]
];
