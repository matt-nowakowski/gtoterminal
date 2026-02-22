/**
 * push-fold-charts.js
 * Nash Equilibrium Push/Fold Charts for Short-Stack Tournament Play (6-max)
 *
 * Stack depths: 3bb, 5bb, 8bb, 10bb, 13bb, 15bb, 18bb, 20bb
 * Positions: UTG, MP, CO, BTN, SB  (push ranges)
 *            BB                     (call_vs ranges for each position's shove)
 *
 * push  = array of canonical hand combos that should be open-shoved
 * call  = array of canonical hand combos the BB should call with
 * Everything not listed = fold
 *
 * Hand notation:
 *   Pairs  -> "AA", "KK", ..., "22"
 *   Suited -> "AKs", "T9s", etc.  (higher rank first)
 *   Offsuit-> "AKo", "T9o", etc.  (higher rank first)
 *
 * Calling ranges are TIGHTER than push ranges at equivalent stacks because
 * the caller has no fold equity and must win at showdown.
 *
 * Approximate range percentages at 10bb (of 169 canonical hands):
 *   UTG ~18%  |  MP ~22%  |  CO ~30%  |  BTN ~42%  |  SB ~50%
 *   At 5bb  roughly double those percentages.
 *   At 20bb roughly halve those percentages.
 *
 * Namespace: GTO.Data.PushFold
 */

window.GTO = window.GTO || {};
GTO.Data = GTO.Data || {};

GTO.Data.PushFold = {

  /* ================================================================
   *  6-MAX TABLE
   * ================================================================ */
  6: {

    // ---------------------------------------------------------------
    // UTG (Under The Gun) - Tightest open-shove position
    // ---------------------------------------------------------------
    UTG: {

      // 3bb  ~65% of hands - desperate, push very wide
      3: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s',
          'JTs','J9s','J8s','J7s','J6s','J5s','J4s',
          'T9s','T8s','T7s','T6s','T5s',
          '98s','97s','96s','95s','94s',
          '87s','86s','85s','84s',
          '76s','75s','74s',
          '65s','64s','63s',
          '54s','53s',
          '43s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o',
          'QJo','QTo','Q9o','Q8o','Q7o',
          'JTo','J9o','J8o','J7o',
          'T9o','T8o','T7o',
          '98o','97o','96o',
          '87o','86o',
          '76o','75o',
          '65o','64o',
          '54o'
        ]
      },

      // 5bb  ~36% - still very wide
      5: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s',
          'QJs','QTs','Q9s','Q8s','Q7s',
          'JTs','J9s','J8s','J7s',
          'T9s','T8s','T7s',
          '98s','97s','96s',
          '87s','86s',
          '76s','75s',
          '65s','64s',
          '54s','53s',
          '43s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o',
          'QJo','QTo','Q9o',
          'JTo','J9o',
          'T9o','T8o',
          '98o',
          '87o',
          '76o'
        ]
      },

      // 8bb  ~24%
      8: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s',
          'QJs','QTs','Q9s',
          'JTs','J9s',
          'T9s','T8s',
          '98s','97s',
          '87s','86s',
          '76s','75s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o',
          'KQo','KJo','KTo',
          'QJo','QTo',
          'JTo'
        ]
      },

      // 10bb  ~18%
      10: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s',
          'KQs','KJs','KTs',
          'QJs',
          'JTs',
          'T9s',
          '98s',
          '87s',
          '76s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo',
          'KQo'
        ]
      },

      // 13bb  ~13%
      13: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66',
          'AKs','AQs','AJs','ATs','A9s','A8s',
          'KQs','KJs','KTs',
          'QJs',
          'JTs',
          'T9s',
          '98s',
          'AKo','AQo','AJo','ATo',
          'KQo'
        ]
      },

      // 15bb  ~10%
      15: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77',
          'AKs','AQs','AJs','ATs','A9s',
          'KQs','KJs',
          'QJs',
          'JTs',
          'AKo','AQo','AJo',
          'KQo'
        ]
      },

      // 18bb  ~8%
      18: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88',
          'AKs','AQs','AJs','ATs',
          'KQs','KJs',
          'AKo','AQo','AJo',
          'KQo'
        ]
      },

      // 20bb  ~7%
      20: {
        push: [
          'AA','KK','QQ','JJ','TT','99',
          'AKs','AQs','AJs','ATs',
          'KQs',
          'AKo','AQo',
          'KQo'
        ]
      }
    },

    // ---------------------------------------------------------------
    // MP (Middle Position) - Slightly wider than UTG
    // ---------------------------------------------------------------
    MP: {

      // 3bb  ~72%
      3: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s',
          'JTs','J9s','J8s','J7s','J6s','J5s','J4s','J3s',
          'T9s','T8s','T7s','T6s','T5s','T4s',
          '98s','97s','96s','95s','94s',
          '87s','86s','85s','84s',
          '76s','75s','74s','73s',
          '65s','64s','63s',
          '54s','53s','52s',
          '43s','42s',
          '32s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o',
          'QJo','QTo','Q9o','Q8o','Q7o','Q6o',
          'JTo','J9o','J8o','J7o','J6o',
          'T9o','T8o','T7o','T6o',
          '98o','97o','96o',
          '87o','86o','85o',
          '76o','75o',
          '65o','64o',
          '54o','53o'
        ]
      },

      // 5bb  ~42%
      5: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s',
          'JTs','J9s','J8s','J7s','J6s',
          'T9s','T8s','T7s','T6s',
          '98s','97s','96s',
          '87s','86s','85s',
          '76s','75s',
          '65s','64s',
          '54s','53s',
          '43s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o',
          'QJo','QTo','Q9o','Q8o',
          'JTo','J9o','J8o',
          'T9o','T8o',
          '98o','97o',
          '87o',
          '76o'
        ]
      },

      // 8bb  ~28%
      8: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s',
          'QJs','QTs','Q9s','Q8s',
          'JTs','J9s','J8s',
          'T9s','T8s',
          '98s','97s',
          '87s','86s',
          '76s','75s',
          '65s','64s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o',
          'KQo','KJo','KTo','K9o',
          'QJo','QTo',
          'JTo','J9o',
          'T9o'
        ]
      },

      // 10bb  ~22%
      10: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs',
          'QJs','QTs',
          'JTs',
          'T9s',
          '98s',
          '87s',
          '76s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo',
          'KQo','KJo'
        ]
      },

      // 13bb  ~16%
      13: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s',
          'KQs','KJs','KTs',
          'QJs','QTs',
          'JTs',
          'T9s',
          '98s',
          '87s',
          'AKo','AQo','AJo','ATo',
          'KQo','KJo'
        ]
      },

      // 15bb  ~13%
      15: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55',
          'AKs','AQs','AJs','ATs','A9s','A8s',
          'KQs','KJs','KTs',
          'QJs',
          'JTs',
          'T9s',
          '98s',
          'AKo','AQo','AJo','ATo',
          'KQo','KJo'
        ]
      },

      // 18bb  ~10%
      18: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77',
          'AKs','AQs','AJs','ATs','A9s',
          'KQs','KJs','KTs',
          'QJs',
          'JTs',
          'AKo','AQo','AJo',
          'KQo'
        ]
      },

      // 20bb  ~9%
      20: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77',
          'AKs','AQs','AJs','ATs',
          'KQs','KJs',
          'QJs',
          'JTs',
          'AKo','AQo','AJo',
          'KQo'
        ]
      }
    },

    // ---------------------------------------------------------------
    // CO (Cutoff) - Wider stealing range
    // ---------------------------------------------------------------
    CO: {

      // 3bb  ~82%
      3: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s',
          'JTs','J9s','J8s','J7s','J6s','J5s','J4s','J3s','J2s',
          'T9s','T8s','T7s','T6s','T5s','T4s','T3s',
          '98s','97s','96s','95s','94s','93s',
          '87s','86s','85s','84s','83s',
          '76s','75s','74s','73s',
          '65s','64s','63s','62s',
          '54s','53s','52s',
          '43s','42s',
          '32s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o','K3o',
          'QJo','QTo','Q9o','Q8o','Q7o','Q6o','Q5o','Q4o',
          'JTo','J9o','J8o','J7o','J6o','J5o',
          'T9o','T8o','T7o','T6o','T5o',
          '98o','97o','96o','95o',
          '87o','86o','85o','84o',
          '76o','75o','74o',
          '65o','64o','63o',
          '54o','53o',
          '43o'
        ]
      },

      // 5bb  ~58%
      5: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s',
          'JTs','J9s','J8s','J7s','J6s','J5s',
          'T9s','T8s','T7s','T6s','T5s',
          '98s','97s','96s','95s',
          '87s','86s','85s',
          '76s','75s','74s',
          '65s','64s',
          '54s','53s',
          '43s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o',
          'QJo','QTo','Q9o','Q8o','Q7o',
          'JTo','J9o','J8o','J7o',
          'T9o','T8o','T7o',
          '98o','97o',
          '87o','86o',
          '76o','75o',
          '65o'
        ]
      },

      // 8bb  ~38%
      8: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s',
          'QJs','QTs','Q9s','Q8s','Q7s',
          'JTs','J9s','J8s','J7s',
          'T9s','T8s','T7s',
          '98s','97s','96s',
          '87s','86s',
          '76s','75s',
          '65s','64s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o',
          'KQo','KJo','KTo','K9o','K8o',
          'QJo','QTo','Q9o',
          'JTo','J9o',
          'T9o','T8o',
          '98o',
          '87o'
        ]
      },

      // 10bb  ~30%
      10: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s',
          'QJs','QTs','Q9s',
          'JTs','J9s',
          'T9s','T8s',
          '98s','97s',
          '87s',
          '76s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o',
          'KQo','KJo','KTo',
          'QJo','QTo',
          'JTo'
        ]
      },

      // 13bb  ~23%
      13: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s',
          'QJs','QTs','Q9s',
          'JTs','J9s',
          'T9s','T8s',
          '98s',
          '87s',
          '76s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o',
          'KQo','KJo','KTo',
          'QJo',
          'JTo'
        ]
      },

      // 15bb  ~18%
      15: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s',
          'KQs','KJs','KTs','K9s',
          'QJs','QTs',
          'JTs','J9s',
          'T9s',
          '98s',
          '87s',
          '76s',
          '65s',
          'AKo','AQo','AJo','ATo','A9o',
          'KQo','KJo','KTo',
          'QJo'
        ]
      },

      // 18bb  ~15%
      18: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s',
          'KQs','KJs','KTs','K9s',
          'QJs','QTs',
          'JTs','J9s',
          'T9s',
          '98s',
          '87s',
          'AKo','AQo','AJo','ATo','A9o',
          'KQo','KJo','KTo',
          'QJo'
        ]
      },

      // 20bb  ~13%
      20: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A5s',
          'KQs','KJs','KTs',
          'QJs','QTs',
          'JTs','J9s',
          'T9s',
          '98s',
          'AKo','AQo','AJo','ATo','A9o',
          'KQo','KJo','KTo',
          'QJo'
        ]
      }
    },

    // ---------------------------------------------------------------
    // BTN (Button) - Widest open-shove from a non-blind position
    // ---------------------------------------------------------------
    BTN: {

      // 3bb  ~90%
      3: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s',
          'JTs','J9s','J8s','J7s','J6s','J5s','J4s','J3s','J2s',
          'T9s','T8s','T7s','T6s','T5s','T4s','T3s','T2s',
          '98s','97s','96s','95s','94s','93s','92s',
          '87s','86s','85s','84s','83s','82s',
          '76s','75s','74s','73s','72s',
          '65s','64s','63s','62s',
          '54s','53s','52s',
          '43s','42s',
          '32s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o','K3o','K2o',
          'QJo','QTo','Q9o','Q8o','Q7o','Q6o','Q5o','Q4o','Q3o',
          'JTo','J9o','J8o','J7o','J6o','J5o','J4o','J3o',
          'T9o','T8o','T7o','T6o','T5o','T4o',
          '98o','97o','96o','95o','94o',
          '87o','86o','85o','84o',
          '76o','75o','74o','73o',
          '65o','64o','63o',
          '54o','53o','52o',
          '43o','42o',
          '32o'
        ]
      },

      // 5bb  ~72%
      5: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s',
          'JTs','J9s','J8s','J7s','J6s','J5s','J4s',
          'T9s','T8s','T7s','T6s','T5s','T4s',
          '98s','97s','96s','95s','94s',
          '87s','86s','85s','84s',
          '76s','75s','74s','73s',
          '65s','64s','63s',
          '54s','53s','52s',
          '43s','42s',
          '32s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o',
          'QJo','QTo','Q9o','Q8o','Q7o','Q6o',
          'JTo','J9o','J8o','J7o','J6o',
          'T9o','T8o','T7o','T6o',
          '98o','97o','96o',
          '87o','86o','85o',
          '76o','75o',
          '65o','64o',
          '54o'
        ]
      },

      // 8bb  ~52%
      8: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s',
          'JTs','J9s','J8s','J7s','J6s',
          'T9s','T8s','T7s','T6s','T5s',
          '98s','97s','96s','95s',
          '87s','86s','85s','84s',
          '76s','75s','74s',
          '65s','64s',
          '54s','53s',
          '43s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o',
          'QJo','QTo','Q9o','Q8o','Q7o','Q6o',
          'JTo','J9o','J8o','J7o',
          'T9o','T8o','T7o','T6o',
          '98o','97o','96o',
          '87o','86o','85o',
          '76o','75o',
          '65o','64o',
          '54o'
        ]
      },

      // 10bb  ~42%
      10: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s',
          'QJs','QTs','Q9s','Q8s','Q7s',
          'JTs','J9s','J8s','J7s',
          'T9s','T8s','T7s',
          '98s','97s','96s',
          '87s','86s',
          '76s','75s',
          '65s','64s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o',
          'KQo','KJo','KTo','K9o','K8o',
          'QJo','QTo','Q9o',
          'JTo','J9o',
          'T9o','T8o',
          '98o',
          '87o'
        ]
      },

      // 13bb  ~32%
      13: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s',
          'QJs','QTs','Q9s','Q8s',
          'JTs','J9s','J8s',
          'T9s','T8s','T7s',
          '98s','97s',
          '87s','86s',
          '76s','75s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o',
          'KQo','KJo','KTo','K9o',
          'QJo','QTo','Q9o',
          'JTo','J9o',
          'T9o',
          '98o'
        ]
      },

      // 15bb  ~25%
      15: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s',
          'QJs','QTs','Q9s',
          'JTs','J9s','J8s',
          'T9s','T8s',
          '98s','97s',
          '87s',
          '76s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o',
          'KQo','KJo','KTo','K9o',
          'QJo','QTo',
          'JTo','J9o',
          'T9o'
        ]
      },

      // 18bb  ~20%
      18: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s',
          'KQs','KJs','KTs','K9s',
          'QJs','QTs','Q9s',
          'JTs','J9s',
          'T9s','T8s',
          '98s',
          '87s',
          '76s',
          '65s',
          'AKo','AQo','AJo','ATo','A9o','A8o',
          'KQo','KJo','KTo',
          'QJo','QTo',
          'JTo'
        ]
      },

      // 20bb  ~18%
      20: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s',
          'KQs','KJs','KTs','K9s',
          'QJs','QTs','Q9s',
          'JTs','J9s',
          'T9s','T8s',
          '98s',
          '87s',
          '76s',
          'AKo','AQo','AJo','ATo','A9o','A8o',
          'KQo','KJo','KTo',
          'QJo','QTo',
          'JTo'
        ]
      }
    },

    // ---------------------------------------------------------------
    // SB (Small Blind) - Very wide push vs BB heads-up
    // ---------------------------------------------------------------
    SB: {

      // 3bb  ~100% - push any two cards
      3: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s',
          'JTs','J9s','J8s','J7s','J6s','J5s','J4s','J3s','J2s',
          'T9s','T8s','T7s','T6s','T5s','T4s','T3s','T2s',
          '98s','97s','96s','95s','94s','93s','92s',
          '87s','86s','85s','84s','83s','82s',
          '76s','75s','74s','73s','72s',
          '65s','64s','63s','62s',
          '54s','53s','52s',
          '43s','42s',
          '32s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o','K3o','K2o',
          'QJo','QTo','Q9o','Q8o','Q7o','Q6o','Q5o','Q4o','Q3o','Q2o',
          'JTo','J9o','J8o','J7o','J6o','J5o','J4o','J3o','J2o',
          'T9o','T8o','T7o','T6o','T5o','T4o','T3o','T2o',
          '98o','97o','96o','95o','94o','93o','92o',
          '87o','86o','85o','84o','83o','82o',
          '76o','75o','74o','73o','72o',
          '65o','64o','63o','62o',
          '54o','53o','52o',
          '43o','42o',
          '32o'
        ]
      },

      // 5bb  ~82%
      5: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s',
          'JTs','J9s','J8s','J7s','J6s','J5s','J4s','J3s',
          'T9s','T8s','T7s','T6s','T5s','T4s','T3s',
          '98s','97s','96s','95s','94s','93s',
          '87s','86s','85s','84s','83s',
          '76s','75s','74s','73s',
          '65s','64s','63s',
          '54s','53s','52s',
          '43s','42s',
          '32s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o','K3o',
          'QJo','QTo','Q9o','Q8o','Q7o','Q6o','Q5o','Q4o','Q3o',
          'JTo','J9o','J8o','J7o','J6o','J5o','J4o',
          'T9o','T8o','T7o','T6o','T5o',
          '98o','97o','96o','95o',
          '87o','86o','85o','84o',
          '76o','75o','74o',
          '65o','64o',
          '54o','53o',
          '43o'
        ]
      },

      // 8bb  ~62%
      8: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
          'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s',
          'JTs','J9s','J8s','J7s','J6s','J5s',
          'T9s','T8s','T7s','T6s','T5s',
          '98s','97s','96s','95s','94s',
          '87s','86s','85s','84s',
          '76s','75s','74s',
          '65s','64s','63s',
          '54s','53s',
          '43s','42s',
          '32s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
          'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o',
          'QJo','QTo','Q9o','Q8o','Q7o','Q6o',
          'JTo','J9o','J8o','J7o','J6o',
          'T9o','T8o','T7o','T6o',
          '98o','97o','96o',
          '87o','86o','85o',
          '76o','75o',
          '65o','64o',
          '54o'
        ]
      },

      // 10bb  ~50%
      10: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s',
          'QJs','QTs','Q9s','Q8s','Q7s',
          'JTs','J9s','J8s','J7s',
          'T9s','T8s','T7s',
          '98s','97s','96s',
          '87s','86s','85s',
          '76s','75s',
          '65s','64s',
          '54s','53s',
          '43s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o',
          'KQo','KJo','KTo','K9o','K8o',
          'QJo','QTo','Q9o','Q8o',
          'JTo','J9o','J8o',
          'T9o','T8o',
          '98o','97o',
          '87o',
          '76o'
        ]
      },

      // 13bb  ~38%
      13: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s',
          'QJs','QTs','Q9s','Q8s','Q7s',
          'JTs','J9s','J8s','J7s',
          'T9s','T8s','T7s',
          '98s','97s','96s',
          '87s','86s',
          '76s','75s',
          '65s','64s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o',
          'KQo','KJo','KTo','K9o','K8o',
          'QJo','QTo','Q9o',
          'JTo','J9o','J8o',
          'T9o','T8o',
          '98o',
          '87o',
          '76o'
        ]
      },

      // 15bb  ~32%
      15: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s','K7s',
          'QJs','QTs','Q9s','Q8s',
          'JTs','J9s','J8s',
          'T9s','T8s','T7s',
          '98s','97s',
          '87s','86s',
          '76s','75s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o',
          'KQo','KJo','KTo','K9o',
          'QJo','QTo','Q9o',
          'JTo','J9o',
          'T9o','T8o',
          '98o',
          '87o'
        ]
      },

      // 18bb  ~27%
      18: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s',
          'QJs','QTs','Q9s','Q8s',
          'JTs','J9s','J8s',
          'T9s','T8s',
          '98s','97s',
          '87s','86s',
          '76s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o',
          'KQo','KJo','KTo','K9o',
          'QJo','QTo','Q9o',
          'JTo','J9o',
          'T9o',
          '98o',
          '87o'
        ]
      },

      // 20bb  ~24%
      20: {
        push: [
          'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33',
          'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
          'KQs','KJs','KTs','K9s','K8s',
          'QJs','QTs','Q9s',
          'JTs','J9s','J8s',
          'T9s','T8s',
          '98s','97s',
          '87s',
          '76s',
          '65s',
          '54s',
          'AKo','AQo','AJo','ATo','A9o','A8o','A7o',
          'KQo','KJo','KTo','K9o',
          'QJo','QTo',
          'JTo','J9o',
          'T9o',
          '98o'
        ]
      }
    },

    // ---------------------------------------------------------------
    // BB (Big Blind) - Calling ranges vs each position's push
    //
    // Calling ranges are TIGHTER than the corresponding push ranges
    // because the caller has no fold equity and must win at showdown.
    // The wider the pusher's range, the wider BB can call profitably.
    // ---------------------------------------------------------------
    BB: {
      call_vs: {

        // --- BB calling vs UTG push ---
        UTG: {
          // 3bb: UTG pushes ~65%, BB calls ~40%
          3: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
              'KQs','KJs','KTs','K9s','K8s',
              'QJs','QTs','Q9s',
              'JTs','J9s',
              'T9s','T8s',
              '98s','97s',
              '87s',
              '76s',
              '65s',
              '54s',
              'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o',
              'KQo','KJo','KTo','K9o',
              'QJo','QTo',
              'JTo','J9o',
              'T9o'
            ]
          },
          // 5bb: UTG pushes ~36%, BB calls ~20%
          5: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77',
              'AKs','AQs','AJs','ATs','A9s','A8s',
              'KQs','KJs','KTs',
              'QJs','QTs',
              'JTs',
              'T9s',
              '98s',
              'AKo','AQo','AJo','ATo',
              'KQo','KJo'
            ]
          },
          // 8bb: UTG pushes ~24%, BB calls ~13%
          8: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88',
              'AKs','AQs','AJs','ATs',
              'KQs','KJs',
              'QJs',
              'JTs',
              'AKo','AQo','AJo',
              'KQo'
            ]
          },
          // 10bb: UTG pushes ~18%, BB calls ~10% (17 hands)
          10: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88',
              'AKs','AQs','AJs','ATs',
              'KQs',
              'QJs',
              'JTs',
              'AKo','AQo','AJo'
            ]
          },
          // 13bb: UTG pushes ~14%, BB calls ~8%
          13: {
            call: [
              'AA','KK','QQ','JJ','TT','99',
              'AKs','AQs','AJs',
              'KQs',
              'AKo','AQo'
            ]
          },
          // 15bb: UTG pushes ~11%, BB calls ~7%
          15: {
            call: [
              'AA','KK','QQ','JJ','TT','99',
              'AKs','AQs',
              'KQs',
              'AKo','AQo'
            ]
          },
          // 18bb: UTG pushes ~9%, BB calls ~6%
          18: {
            call: [
              'AA','KK','QQ','JJ','TT',
              'AKs','AQs',
              'AKo','AQo'
            ]
          },
          // 20bb: UTG pushes ~8%, BB calls ~5%
          20: {
            call: [
              'AA','KK','QQ','JJ','TT',
              'AKs','AQs',
              'AKo'
            ]
          }
        },

        // --- BB calling vs MP push ---
        MP: {
          3: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
              'KQs','KJs','KTs','K9s','K8s','K7s',
              'QJs','QTs','Q9s','Q8s',
              'JTs','J9s','J8s',
              'T9s','T8s',
              '98s','97s',
              '87s','86s',
              '76s',
              '65s',
              '54s',
              'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o',
              'KQo','KJo','KTo','K9o','K8o',
              'QJo','QTo','Q9o',
              'JTo','J9o',
              'T9o'
            ]
          },
          5: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s',
              'KQs','KJs','KTs',
              'QJs','QTs',
              'JTs','J9s',
              'T9s',
              '98s',
              '87s',
              'AKo','AQo','AJo','ATo','A9o',
              'KQo','KJo','KTo',
              'QJo'
            ]
          },
          8: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77',
              'AKs','AQs','AJs','ATs','A9s',
              'KQs','KJs','KTs',
              'QJs',
              'JTs',
              'AKo','AQo','AJo','ATo',
              'KQo','KJo'
            ]
          },
          // 10bb: MP pushes ~22%, BB calls ~12%
          10: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88',
              'AKs','AQs','AJs','ATs',
              'KQs','KJs',
              'QJs',
              'JTs',
              'AKo','AQo','AJo',
              'KQo'
            ]
          },
          13: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88',
              'AKs','AQs','AJs','ATs',
              'KQs','KJs',
              'AKo','AQo','AJo',
              'KQo'
            ]
          },
          15: {
            call: [
              'AA','KK','QQ','JJ','TT','99',
              'AKs','AQs','AJs',
              'KQs','KJs',
              'AKo','AQo','AJo',
              'KQo'
            ]
          },
          18: {
            call: [
              'AA','KK','QQ','JJ','TT','99',
              'AKs','AQs','AJs',
              'KQs',
              'AKo','AQo'
            ]
          },
          20: {
            call: [
              'AA','KK','QQ','JJ','TT',
              'AKs','AQs','AJs',
              'KQs',
              'AKo','AQo'
            ]
          }
        },

        // --- BB calling vs CO push ---
        CO: {
          3: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
              'KQs','KJs','KTs','K9s','K8s','K7s','K6s',
              'QJs','QTs','Q9s','Q8s','Q7s',
              'JTs','J9s','J8s','J7s',
              'T9s','T8s','T7s',
              '98s','97s','96s',
              '87s','86s','85s',
              '76s','75s',
              '65s','64s',
              '54s','53s',
              '43s',
              'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o',
              'KQo','KJo','KTo','K9o','K8o',
              'QJo','QTo','Q9o','Q8o',
              'JTo','J9o','J8o',
              'T9o','T8o',
              '98o','97o',
              '87o',
              '76o'
            ]
          },
          5: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s',
              'KQs','KJs','KTs','K9s',
              'QJs','QTs','Q9s',
              'JTs','J9s',
              'T9s','T8s',
              '98s',
              '87s',
              '76s',
              'AKo','AQo','AJo','ATo','A9o','A8o',
              'KQo','KJo','KTo',
              'QJo','QTo',
              'JTo'
            ]
          },
          8: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s',
              'KQs','KJs','KTs',
              'QJs','QTs',
              'JTs',
              'T9s',
              '98s',
              '87s',
              'AKo','AQo','AJo','ATo','A9o',
              'KQo','KJo','KTo',
              'QJo'
            ]
          },
          // 10bb: CO pushes ~30%, BB calls ~17%
          10: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66',
              'AKs','AQs','AJs','ATs','A9s','A8s',
              'KQs','KJs','KTs',
              'QJs','QTs',
              'JTs',
              'T9s',
              '98s',
              'AKo','AQo','AJo','ATo','A9o',
              'KQo','KJo'
            ]
          },
          13: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77',
              'AKs','AQs','AJs','ATs','A9s','A8s',
              'KQs','KJs','KTs',
              'QJs','QTs',
              'JTs',
              'AKo','AQo','AJo','ATo',
              'KQo','KJo'
            ]
          },
          15: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77',
              'AKs','AQs','AJs','ATs','A9s',
              'KQs','KJs','KTs',
              'QJs',
              'JTs',
              'AKo','AQo','AJo','ATo',
              'KQo','KJo'
            ]
          },
          18: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88',
              'AKs','AQs','AJs','ATs','A9s',
              'KQs','KJs',
              'QJs',
              'AKo','AQo','AJo',
              'KQo'
            ]
          },
          20: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88',
              'AKs','AQs','AJs','ATs',
              'KQs','KJs',
              'QJs',
              'AKo','AQo','AJo',
              'KQo'
            ]
          }
        },

        // --- BB calling vs BTN push ---
        BTN: {
          3: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
              'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s',
              'QJs','QTs','Q9s','Q8s','Q7s','Q6s',
              'JTs','J9s','J8s','J7s','J6s',
              'T9s','T8s','T7s','T6s',
              '98s','97s','96s','95s',
              '87s','86s','85s',
              '76s','75s','74s',
              '65s','64s',
              '54s','53s',
              '43s',
              'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o',
              'KQo','KJo','KTo','K9o','K8o','K7o',
              'QJo','QTo','Q9o','Q8o',
              'JTo','J9o','J8o',
              'T9o','T8o','T7o',
              '98o','97o',
              '87o','86o',
              '76o','75o',
              '65o'
            ]
          },
          5: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s',
              'KQs','KJs','KTs','K9s','K8s',
              'QJs','QTs','Q9s','Q8s',
              'JTs','J9s','J8s',
              'T9s','T8s',
              '98s','97s',
              '87s','86s',
              '76s',
              '65s',
              '54s',
              'AKo','AQo','AJo','ATo','A9o','A8o','A7o',
              'KQo','KJo','KTo','K9o',
              'QJo','QTo','Q9o',
              'JTo','J9o',
              'T9o',
              '98o'
            ]
          },
          8: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s',
              'KQs','KJs','KTs','K9s',
              'QJs','QTs','Q9s',
              'JTs','J9s',
              'T9s','T8s',
              '98s',
              '87s',
              '76s',
              'AKo','AQo','AJo','ATo','A9o','A8o',
              'KQo','KJo','KTo',
              'QJo','QTo',
              'JTo'
            ]
          },
          // 10bb: BTN pushes ~42%, BB calls ~22%
          10: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s',
              'KQs','KJs','KTs','K9s',
              'QJs','QTs','Q9s',
              'JTs','J9s',
              'T9s','T8s',
              '98s',
              '87s',
              'AKo','AQo','AJo','ATo','A9o','A8o',
              'KQo','KJo','KTo',
              'QJo','QTo'
            ]
          },
          13: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s',
              'KQs','KJs','KTs','K9s',
              'QJs','QTs',
              'JTs','J9s',
              'T9s',
              '98s',
              'AKo','AQo','AJo','ATo','A9o',
              'KQo','KJo','KTo',
              'QJo'
            ]
          },
          15: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66',
              'AKs','AQs','AJs','ATs','A9s','A8s',
              'KQs','KJs','KTs',
              'QJs','QTs',
              'JTs',
              'T9s',
              '98s',
              'AKo','AQo','AJo','ATo','A9o',
              'KQo','KJo','KTo',
              'QJo'
            ]
          },
          18: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77',
              'AKs','AQs','AJs','ATs','A9s','A8s',
              'KQs','KJs','KTs',
              'QJs','QTs',
              'JTs',
              'AKo','AQo','AJo','ATo','A9o',
              'KQo','KJo','KTo',
              'QJo'
            ]
          },
          20: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77',
              'AKs','AQs','AJs','ATs','A9s',
              'KQs','KJs','KTs',
              'QJs','QTs',
              'JTs',
              'AKo','AQo','AJo','ATo',
              'KQo','KJo',
              'QJo'
            ]
          }
        },

        // --- BB calling vs SB push ---
        SB: {
          // 3bb: SB pushes 100%, BB calls ~55%
          3: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
              'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s',
              'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s',
              'JTs','J9s','J8s','J7s','J6s','J5s',
              'T9s','T8s','T7s','T6s','T5s',
              '98s','97s','96s','95s',
              '87s','86s','85s','84s',
              '76s','75s','74s',
              '65s','64s','63s',
              '54s','53s',
              '43s','42s',
              '32s',
              'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
              'KQo','KJo','KTo','K9o','K8o','K7o','K6o',
              'QJo','QTo','Q9o','Q8o','Q7o',
              'JTo','J9o','J8o','J7o',
              'T9o','T8o','T7o',
              '98o','97o','96o',
              '87o','86o',
              '76o','75o',
              '65o','64o',
              '54o'
            ]
          },
          // 5bb: SB pushes ~82%, BB calls ~38%
          5: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
              'KQs','KJs','KTs','K9s','K8s','K7s',
              'QJs','QTs','Q9s','Q8s','Q7s',
              'JTs','J9s','J8s','J7s',
              'T9s','T8s','T7s',
              '98s','97s','96s',
              '87s','86s','85s',
              '76s','75s',
              '65s','64s',
              '54s',
              'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o',
              'KQo','KJo','KTo','K9o','K8o',
              'QJo','QTo','Q9o','Q8o',
              'JTo','J9o','J8o',
              'T9o','T8o',
              '98o','97o',
              '87o',
              '76o'
            ]
          },
          // 8bb: SB pushes ~62%, BB calls ~30%
          8: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s',
              'KQs','KJs','KTs','K9s','K8s',
              'QJs','QTs','Q9s','Q8s',
              'JTs','J9s','J8s',
              'T9s','T8s','T7s',
              '98s','97s',
              '87s','86s',
              '76s','75s',
              '65s',
              '54s',
              'AKo','AQo','AJo','ATo','A9o','A8o','A7o',
              'KQo','KJo','KTo','K9o',
              'QJo','QTo','Q9o',
              'JTo','J9o',
              'T9o',
              '98o',
              '87o'
            ]
          },
          // 10bb: SB pushes ~50%, BB calls ~25% (43 hands)
          10: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s',
              'KQs','KJs','KTs','K9s',
              'QJs','QTs','Q9s',
              'JTs','J9s','J8s',
              'T9s','T8s',
              '98s','97s',
              '87s',
              '76s',
              '65s',
              '54s',
              'AKo','AQo','AJo','ATo','A9o','A8o',
              'KQo','KJo','KTo',
              'QJo','QTo',
              'JTo'
            ]
          },
          // 13bb: SB pushes ~40%, BB calls ~22%
          13: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55','44',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s',
              'KQs','KJs','KTs','K9s',
              'QJs','QTs','Q9s',
              'JTs','J9s','J8s',
              'T9s','T8s',
              '98s','97s',
              '87s',
              '76s',
              '65s',
              'AKo','AQo','AJo','ATo','A9o','A8o',
              'KQo','KJo','KTo','K9o',
              'QJo','QTo',
              'JTo','J9o',
              'T9o'
            ]
          },
          // 15bb: SB pushes ~34%, BB calls ~19%
          15: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s',
              'KQs','KJs','KTs','K9s',
              'QJs','QTs','Q9s',
              'JTs','J9s',
              'T9s','T8s',
              '98s',
              '87s',
              '76s',
              'AKo','AQo','AJo','ATo','A9o','A8o',
              'KQo','KJo','KTo',
              'QJo','QTo',
              'JTo'
            ]
          },
          // 18bb: SB pushes ~28%, BB calls ~16%
          18: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s',
              'KQs','KJs','KTs','K9s',
              'QJs','QTs','Q9s',
              'JTs','J9s',
              'T9s',
              '98s',
              '87s',
              'AKo','AQo','AJo','ATo','A9o','A8o',
              'KQo','KJo','KTo',
              'QJo','QTo',
              'JTo'
            ]
          },
          // 20bb: SB pushes ~24%, BB calls ~14%
          20: {
            call: [
              'AA','KK','QQ','JJ','TT','99','88','77','66','55',
              'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A5s',
              'KQs','KJs','KTs','K9s',
              'QJs','QTs','Q9s',
              'JTs','J9s',
              'T9s',
              '98s',
              '87s',
              'AKo','AQo','AJo','ATo','A9o',
              'KQo','KJo','KTo',
              'QJo','QTo',
              'JTo'
            ]
          }
        }

      } // end call_vs
    } // end BB

  } // end 6-max

}; // end GTO.Data.PushFold


// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Lookup push/fold decision for a given hand.
 *
 * @param {number} players  - Number of players at the table (e.g. 6)
 * @param {string} position - Seat: 'UTG','MP','CO','BTN','SB'
 * @param {number} stackBB  - Effective stack in big blinds
 * @param {string} hand     - Canonical hand notation (e.g. 'AKs','77','T9o')
 * @returns {Object|null}   - { action, inRange, stackUsed, rangeSize } or null
 */
GTO.Data.lookupPushFold = function(players, position, stackBB, hand) {
  var tableData = this.PushFold[players];
  if (!tableData) {
    return null;
  }

  // BB has calling ranges, not push ranges
  if (position === 'BB') {
    return null; // Use lookupBBCall instead
  }

  var posData = tableData[position];
  if (!posData) {
    return null;
  }

  // Find the closest stack size in the chart
  var availableStacks = [];
  for (var s in posData) {
    if (posData.hasOwnProperty(s)) {
      availableStacks.push(parseInt(s, 10));
    }
  }
  availableStacks.sort(function(a, b) { return a - b; });

  // Clamp to bounds: if below lowest chart, use lowest; if above highest, use highest
  var closestStack = availableStacks[0];
  var minDiff = Math.abs(stackBB - closestStack);
  for (var i = 1; i < availableStacks.length; i++) {
    var diff = Math.abs(stackBB - availableStacks[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closestStack = availableStacks[i];
    }
  }

  var stackData = posData[closestStack];
  if (!stackData || !stackData.push) {
    return null;
  }

  // Check if hand is in push range
  var inRange = stackData.push.indexOf(hand) !== -1;

  return {
    action: inRange ? 'push' : 'fold',
    inRange: inRange,
    stackUsed: closestStack,
    rangeSize: stackData.push.length
  };
};

/**
 * Lookup BB calling range vs a specific position's push.
 *
 * @param {number} players    - Number of players at the table (e.g. 6)
 * @param {string} vsPosition - Position that pushed: 'UTG','MP','CO','BTN','SB'
 * @param {number} stackBB    - Effective stack in big blinds
 * @param {string} hand       - Canonical hand notation
 * @returns {Object|null}     - { action, inRange, stackUsed, rangeSize } or null
 */
GTO.Data.lookupBBCall = function(players, vsPosition, stackBB, hand) {
  var tableData = this.PushFold[players];
  if (!tableData || !tableData.BB || !tableData.BB.call_vs) {
    return null;
  }

  var callVs = tableData.BB.call_vs[vsPosition];
  if (!callVs) {
    return null;
  }

  // Find the closest stack size
  var availableStacks = [];
  for (var s in callVs) {
    if (callVs.hasOwnProperty(s)) {
      availableStacks.push(parseInt(s, 10));
    }
  }
  availableStacks.sort(function(a, b) { return a - b; });

  var closestStack = availableStacks[0];
  var minDiff = Math.abs(stackBB - closestStack);
  for (var i = 1; i < availableStacks.length; i++) {
    var diff = Math.abs(stackBB - availableStacks[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closestStack = availableStacks[i];
    }
  }

  var stackData = callVs[closestStack];
  if (!stackData || !stackData.call) {
    return null;
  }

  var inRange = stackData.call.indexOf(hand) !== -1;

  return {
    action: inRange ? 'call' : 'fold',
    inRange: inRange,
    stackUsed: closestStack,
    rangeSize: stackData.call.length
  };
};

/**
 * Get the push range as a percentage of all 169 canonical hand combos.
 *
 * @param {number} players  - Number of players at the table
 * @param {string} position - Seat name
 * @param {number} stackBB  - Effective stack in big blinds
 * @returns {number}        - Percentage (0-100)
 */
GTO.Data.getPushRangePercent = function(players, position, stackBB) {
  var result = this.lookupPushFold(players, position, stackBB, '__dummy__');
  if (!result) return 0;
  return Math.round((result.rangeSize / 169) * 100);
};

/**
 * Get the BB call range as a percentage of all 169 canonical hand combos.
 *
 * @param {number} players    - Number of players at the table
 * @param {string} vsPosition - Position that pushed
 * @param {number} stackBB    - Effective stack in big blinds
 * @returns {number}          - Percentage (0-100)
 */
GTO.Data.getBBCallRangePercent = function(players, vsPosition, stackBB) {
  var result = this.lookupBBCall(players, vsPosition, stackBB, '__dummy__');
  if (!result) return 0;
  return Math.round((result.rangeSize / 169) * 100);
};

/**
 * Get all available stack sizes for a position in the push charts.
 *
 * @param {number} players  - Number of players at the table
 * @param {string} position - Seat name
 * @returns {number[]}      - Sorted array of stack sizes (e.g. [3,5,8,10,13,15,18,20])
 */
GTO.Data.getAvailableStacks = function(players, position) {
  var tableData = this.PushFold[players];
  if (!tableData) return [];

  var posData = tableData[position];
  if (!posData) return [];

  var stacks = [];
  for (var s in posData) {
    if (posData.hasOwnProperty(s) && s !== 'call_vs') {
      stacks.push(parseInt(s, 10));
    }
  }
  return stacks.sort(function(a, b) { return a - b; });
};
