window.GTO = window.GTO || {};
GTO.Content = GTO.Content || {};

GTO.Content.ProfileView = {
  render: function() {
    var container = document.getElementById('stats-profile');
    if (!container) return;

    var profile = GTO.Content.PlayerProfile.compute();

    var html = '<div class="profile-grid">';

    // Skill badge
    html += '<div class="profile-skill-badge" style="border-color:' + profile.skillRating.color + ';">';
    html += '<div class="profile-skill-score" style="color:' + profile.skillRating.color + ';">' + profile.skillRating.score + '</div>';
    html += '<div class="profile-skill-label" style="color:' + profile.skillRating.color + ';">' + profile.skillRating.level + '</div>';
    html += '</div>';

    // Right side: metrics + details
    html += '<div>';

    // Metrics row
    html += '<div class="profile-metrics">';
    html += this._metricCard(profile.totalDecisions.toLocaleString(), 'Decisions');
    html += this._metricCard(profile.totalDecisions > 0 ? Math.round(profile.overallAccuracy * 100) + '%' : '--', 'Accuracy');
    html += this._metricCard(profile.totalDecisions > 0 ? GTO.Utils.formatEV(profile.totalEvLoss) : '--', 'EV Loss');
    html += this._metricCard(profile.sessionsCompleted.toString(), 'Sessions');
    html += this._metricCard(profile.favoritePosition, 'Fav Pos');
    html += '</div>';

    // Strengths + Achievements + Recommended in a row
    html += '<div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-top:12px;">';

    // Strengths
    html += '<div>';
    html += '<div class="profile-section-header">STRENGTHS</div>';
    if (profile.strengths.length > 0) {
      html += '<div class="profile-strengths">';
      profile.strengths.forEach(function(s) {
        html += '<div class="profile-strength-item">';
        html += '<span class="str-label">' + s.label + '</span>';
        html += '<span class="str-value">' + Math.round(s.accuracy * 100) + '%</span>';
        html += '</div>';
      });
      html += '</div>';
    } else {
      html += '<div class="text-dim" style="font-size:10px;">Not enough data yet</div>';
    }
    html += '</div>';

    // Achievements
    html += '<div>';
    html += '<div class="profile-section-header">ACHIEVEMENTS</div>';
    if (profile.achievements.length > 0) {
      html += '<div class="profile-achievements">';
      profile.achievements.forEach(function(a) {
        html += '<div class="profile-achievement" title="' + a.desc + '">' + a.label + '</div>';
      });
      html += '</div>';
    } else {
      html += '<div class="text-dim" style="font-size:10px;">Complete drills to earn badges</div>';
    }
    html += '</div>';

    // Recommended content
    html += '<div>';
    html += '<div class="profile-section-header">RECOMMENDED READING</div>';
    if (profile.recommendedContent.length > 0) {
      html += '<div class="profile-recommended">';
      profile.recommendedContent.forEach(function(topic) {
        html += '<button class="profile-rec-link" data-topic-id="' + topic.id + '">' + topic.title + '</button>';
      });
      html += '</div>';
    } else {
      html += '<div class="text-dim" style="font-size:10px;">Complete drills to get recommendations</div>';
    }
    html += '</div>';

    html += '</div>'; // 3-column grid
    html += '</div>'; // right side
    html += '</div>'; // profile-grid

    container.innerHTML = html;

    // Wire recommended content links
    container.querySelectorAll('.profile-rec-link').forEach(function(link) {
      link.addEventListener('click', function() {
        var topicId = this.getAttribute('data-topic-id');
        if (topicId) {
          GTO.UI.Nav.switchView('learn');
          setTimeout(function() {
            GTO.Content.LearnView._openTopic(topicId);
          }, 100);
        }
      });
    });
  },

  _metricCard: function(value, label) {
    return '<div class="profile-metric-card">' +
      '<div class="profile-metric-value">' + value + '</div>' +
      '<div class="profile-metric-label">' + label + '</div>' +
    '</div>';
  }
};
