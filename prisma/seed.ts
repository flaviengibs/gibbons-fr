import { PrismaClient, SwingType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('seed : debut...');

  const forest = await db.forest.upsert({
    where: { slug: 'penser-mieux' },
    update: {},
    create: { name: 'Penser mieux', slug: 'penser-mieux', description: 'Biais cognitifs, logique, decision, persuasion et heuristiques.' },
  });

  const branchDefs = [
    { name: 'Biais cognitifs', slug: 'biais-cognitifs' },
    { name: 'Logique et raisonnement', slug: 'logique-raisonnement' },
    { name: 'Prise de decision', slug: 'prise-de-decision' },
    { name: 'Persuasion et influence', slug: 'persuasion-influence' },
    { name: 'Heuristiques', slug: 'heuristiques' },
  ];

  const branches: Record<string, string> = {};
  for (const def of branchDefs) {
    const branch = await db.branch.upsert({
      where: { forestId_slug: { forestId: forest.id, slug: def.slug } },
      update: {},
      create: { name: def.name, slug: def.slug, forestId: forest.id },
    });
    branches[def.slug] = branch.id;
  }

  const passwordHash = await bcrypt.hash('gibbons-editor-2026', 12);
  const editor = await db.user.upsert({
    where: { email: 'editor@gibbons.fr' },
    update: {},
    create: { email: 'editor@gibbons.fr', name: 'Equipe Gibbons', passwordHash, role: 'CREATOR', isEditorial: true },
  });

  type SwingDef = { title: string; type: SwingType; branchSlug: string; estimatedDuration: number; content: object; };

  const swingDefs: SwingDef[] = [
    { title: 'Le biais de confirmation', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'On cherche naturellement les informations qui confirment nos croyances, en ignorant celles qui les contredisent.', visualUrl: '', animationData: {} } },
    { title: 'L effet de halo', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'Une premiere impression positive colore toute notre perception. Si quelqu un est charismatique, on lui attribue automatiquement d autres qualites.', visualUrl: '', animationData: {} } },
    { title: 'Le biais de disponibilite', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'On surestime la probabilite des evenements faciles a memoriser. Apres un reportage sur des requins, on surestime le risque d attaque.', visualUrl: '', animationData: {} } },
    { title: 'L ancrage cognitif', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'Le premier chiffre entendu influence toutes nos estimations suivantes. 400 euros semble une bonne affaire si on vous a d abord dit 1000.', visualUrl: '', animationData: {} } },
    { title: 'Le biais du survivant', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'On ne voit que les succes, pas les echecs qui ont disparu. Les entrepreneurs qui ont reussi parlent de leur audace — les autres sont invisibles.', visualUrl: '', animationData: {} } },
    { title: 'L effet Dunning-Kruger', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 75, content: { type: 'TYPE_A', text: 'Les moins competents surestiment souvent leurs capacites, car ils manquent des connaissances pour mesurer leur ignorance.', visualUrl: '', animationData: {} } },
    { title: 'Le biais de statu quo', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'On prefere l etat actuel des choses meme quand changer serait benefique. Le changement est percu comme une perte potentielle.', visualUrl: '', animationData: {} } },
    { title: 'La pensee de groupe', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 75, content: { type: 'TYPE_A', text: 'Dans un groupe, la pression sociale pousse a l uniformite. Les membres evitent d exprimer des doutes pour ne pas perturber la cohesion.', visualUrl: '', animationData: {} } },
    { title: 'Le biais retrospectif', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'Apres un evenement, on croit qu on l avait prevu. Ce biais empeche d apprendre de nos erreurs car on pense avoir toujours su.', visualUrl: '', animationData: {} } },
    { title: 'L effet de cadrage', type: 'TYPE_A', branchSlug: 'biais-cognitifs', estimatedDuration: 60, content: { type: 'TYPE_A', text: '90% de survie et 10% de mortalite sont identiques, mais la premiere formulation est toujours preferee. La presentation change la decision.', visualUrl: '', animationData: {} } },
    { title: 'Le rasoir d Occam', type: 'TYPE_A', branchSlug: 'logique-raisonnement', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'Parmi plusieurs explications, la plus simple est generalement la bonne. Ne pas multiplier les hypotheses sans necessite.', visualUrl: '', animationData: {} } },
    { title: 'La loi de Goodhart', type: 'TYPE_A', branchSlug: 'prise-de-decision', estimatedDuration: 75, content: { type: 'TYPE_A', text: 'Quand une mesure devient un objectif, elle cesse d etre une bonne mesure. Les indicateurs finissent par etre optimises au detriment de ce qu ils mesurent.', visualUrl: '', animationData: {} } },
    { title: 'La preuve sociale', type: 'TYPE_A', branchSlug: 'persuasion-influence', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'On tend a faire ce que les autres font, surtout dans l incertitude. Les avis clients et les temoignages exploitent ce mecanisme.', visualUrl: '', animationData: {} } },
    { title: 'L heuristique de representativite', type: 'TYPE_A', branchSlug: 'heuristiques', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'On juge la probabilite d un evenement selon sa ressemblance avec un prototype, en ignorant les statistiques de base.', visualUrl: '', animationData: {} } },
    { title: 'L heuristique d affect', type: 'TYPE_A', branchSlug: 'heuristiques', estimatedDuration: 60, content: { type: 'TYPE_A', text: 'Nos emotions influencent nos jugements de risque. Ce qu on aime semble moins risque et plus benefique que ce qu on n aime pas.', visualUrl: '', animationData: {} } },
    { title: 'Quel biais — le medecin', type: 'TYPE_B', branchSlug: 'biais-cognitifs', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Un medecin diagnostique 10 patients avec la meme maladie rare qu il a etudiee recemment. Quel biais est en jeu ?', options: ['Biais de confirmation', 'Biais de disponibilite', 'Effet de halo', 'Biais du survivant'], correctIndex: 1, explanation: 'Le biais de disponibilite : la maladie recemment etudiee est plus accessible en memoire, ce qui fausse le diagnostic.' } },
    { title: 'Vrai ou faux — le syllogisme', type: 'TYPE_B', branchSlug: 'logique-raisonnement', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Tous les chats sont des animaux. Tous les animaux sont mortels. Donc tous les chats sont mortels. Ce raisonnement est-il valide ?', options: ['Vrai — valide', 'Faux — invalide', 'Impossible a determiner', 'Valide mais non pertinent'], correctIndex: 0, explanation: 'Syllogisme valide : si A implique B et B implique C, alors A implique C.' } },
    { title: 'Detectez le sophisme', type: 'TYPE_B', branchSlug: 'logique-raisonnement', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Tu ne peux pas critiquer la politique economique, tu n as pas de diplome en economie. Quel sophisme ?', options: ['Appel a l autorite', 'Ad hominem', 'Homme de paille', 'Fausse dichotomie'], correctIndex: 1, explanation: 'Ad hominem : on attaque la personne plutot que l argument.' } },
    { title: 'Le dilemme du tramway', type: 'TYPE_B', branchSlug: 'prise-de-decision', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Un tramway fonce vers 5 personnes. Vous pouvez le devier vers 1 personne. Quelle approche ethique justifie d actionner l aiguillage ?', options: ['L utilitarisme', 'La deontologie kantienne', 'L ethique de la vertu', 'Le relativisme moral'], correctIndex: 0, explanation: 'L utilitarisme justifie l action : sauver 5 vies au prix d une maximise le bien-etre global.' } },
    { title: 'Quel biais — les actions', type: 'TYPE_B', branchSlug: 'biais-cognitifs', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Un investisseur vend ses actions perdantes rapidement mais garde les gagnantes trop longtemps. Quel biais ?', options: ['Biais de confirmation', 'Aversion a la perte', 'Effet de dotation', 'Biais d optimisme'], correctIndex: 1, explanation: 'L aversion a la perte : les pertes sont deux fois plus douloureuses que les gains equivalents.' } },
    { title: 'Vrai ou faux — la correlation', type: 'TYPE_B', branchSlug: 'logique-raisonnement', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Les pays qui consomment le plus de chocolat produisent le plus de laureats Nobel. Le chocolat rend-il plus intelligent ?', options: ['Oui — la correlation prouve la causalite', 'Non — correlation ne signifie pas causalite', 'Oui si la correlation est forte', 'Impossible a determiner'], correctIndex: 1, explanation: 'Correlation ne signifie pas causalite. La richesse du pays explique probablement les deux variables.' } },
    { title: 'Quel principe de persuasion', type: 'TYPE_B', branchSlug: 'persuasion-influence', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Seulement 3 articles restants en stock ! Quel principe de persuasion ce message exploite-t-il ?', options: ['Reciprocite', 'Autorite', 'Rarete', 'Coherence'], correctIndex: 2, explanation: 'La rarete (Cialdini) : ce qui est limite semble plus desirable. La peur de manquer pousse a l action.' } },
    { title: 'Heuristique ou raisonnement', type: 'TYPE_B', branchSlug: 'heuristiques', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Une batte et une balle coutent 1,10 euro. La batte coute 1 euro de plus. Combien coute la balle ?', options: ['10 centimes', '5 centimes', '1 euro', '50 centimes'], correctIndex: 1, explanation: 'La reponse intuitive est 10 centimes, mais c est faux. Si balle = x, batte = x+1, et x+(x+1)=1,10, donc x=0,05.' } },
    { title: 'Quel biais — le CV', type: 'TYPE_B', branchSlug: 'biais-cognitifs', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Un recruteur rappelle plus souvent Alexandre que Kevin pour des CV identiques. Quel biais ?', options: ['Biais de confirmation', 'Biais de representativite', 'Biais implicite', 'Effet de halo'], correctIndex: 2, explanation: 'Biais implicite : des associations inconscientes liees au prenom influencent le jugement.' } },
    { title: 'Vrai ou faux — la double negation', type: 'TYPE_B', branchSlug: 'logique-raisonnement', estimatedDuration: 75, content: { type: 'TYPE_B', problem: 'Il n est pas impossible que cette theorie soit fausse. Cela signifie-t-il que la theorie pourrait etre vraie ?', options: ['Oui — la double negation affirme la possibilite', 'Non', 'Cela depend du contexte', 'C est une tautologie'], correctIndex: 0, explanation: 'Pas impossible = possible. La double negation equivaut a une affirmation.' } },
    { title: 'Quel biais — la loterie', type: 'TYPE_B', branchSlug: 'heuristiques', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Apres avoir entendu parler d un gagnant au loto dans son quartier, Paul achete plus de billets. Quel biais ?', options: ['Biais de disponibilite', 'Biais de confirmation', 'Effet de halo', 'Biais d optimisme'], correctIndex: 0, explanation: 'Le biais de disponibilite : l evenement recent rend la victoire plus disponible mentalement.' } },
    { title: 'Le pied dans la porte', type: 'TYPE_B', branchSlug: 'persuasion-influence', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Un vendeur vous demande d abord de signer une petition, puis un don. Quel principe exploite-t-il ?', options: ['Rarete', 'Coherence et engagement', 'Reciprocite', 'Preuve sociale'], correctIndex: 1, explanation: 'Coherence : une fois qu on a dit oui a une petite demande, on tend a accepter des demandes plus importantes.' } },
    { title: 'Quel biais — le medecin et le patient', type: 'TYPE_B', branchSlug: 'prise-de-decision', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Un medecin prescrit toujours le meme traitement meme si de nouvelles etudes montrent mieux. Quel biais ?', options: ['Biais de confirmation', 'Biais de statu quo', 'Effet Dunning-Kruger', 'Biais retrospectif'], correctIndex: 1, explanation: 'Biais de statu quo : on prefere maintenir les pratiques existantes meme face a des preuves favorisant le changement.' } },
    { title: 'L argument d autorite', type: 'TYPE_B', branchSlug: 'logique-raisonnement', estimatedDuration: 75, content: { type: 'TYPE_B', problem: 'Un prix Nobel de physique affirme que cette therapie alternative fonctionne. Cet argument est-il valide ?', options: ['Oui — un Nobel est credible', 'Non — physique ne valide pas une therapie', 'Oui si le Nobel a etudie la question', 'Cela depend de la therapie'], correctIndex: 1, explanation: 'Appel a une autorite non pertinente. L expertise en physique ne confere pas de credibilite en medecine.' } },
    { title: 'Le projet informatique', type: 'TYPE_B', branchSlug: 'prise-de-decision', estimatedDuration: 90, content: { type: 'TYPE_B', problem: 'Une entreprise a investi 2M dans un logiciel qui ne marche pas. Elle investit 500k de plus pour ne pas perdre ce qu elle a depense. Quel biais ?', options: ['Biais de confirmation', 'Cout irrecuperable', 'Biais d optimisme', 'Effet de dotation'], correctIndex: 1, explanation: 'Sunk cost fallacy : les couts passes ne doivent pas influencer les decisions futures.' } },
    { title: 'Reformulez pour convaincre', type: 'TYPE_C', branchSlug: 'persuasion-influence', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Reformulez cette phrase en utilisant le cadrage positif : Ce traitement echoue dans 30% des cas.', inputType: 'text', rubric: 'Bonne reponse : Ce traitement reussit dans 70% des cas. Le sens est identique mais la presentation change la perception.' } },
    { title: 'Identifiez le biais publicitaire', type: 'TYPE_C', branchSlug: 'biais-cognitifs', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Identifiez le biais dans : 9 dentistes sur 10 recommandent ce dentifrice. Ne soyez pas le seul a ne pas l utiliser !', inputType: 'text', rubric: 'Deux biais : appel a l autorite (9 dentistes) et preuve sociale / peur d exclusion.' } },
    { title: 'Construisez un syllogisme', type: 'TYPE_C', branchSlug: 'logique-raisonnement', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Construisez un syllogisme valide : Tous les mammiferes respirent. Les dauphins sont des mammiferes.', inputType: 'text', rubric: 'Conclusion : Donc les dauphins respirent. Forme : Tous A sont B. X est A. Donc X est B.' } },
    { title: 'Detectez le biais dans cet email', type: 'TYPE_C', branchSlug: 'biais-cognitifs', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Identifiez les biais : Offre exclusive ! 5 places restantes. 2000 clients satisfaits. Rejoignez-les avant ce soir !', inputType: 'text', rubric: 'Rarete (5 places), preuve sociale (2000 clients), urgence artificielle (avant ce soir).' } },
    { title: 'Reformulez sans biais de cadrage', type: 'TYPE_C', branchSlug: 'prise-de-decision', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Reformulez de facon neutre : Ce placement a une chance sur cinq de vous faire perdre de l argent.', inputType: 'text', rubric: 'Neutre : Ce placement a 20% de probabilite de perte et 80% de gain.' } },
    { title: 'Appliquez le rasoir d Occam', type: 'TYPE_C', branchSlug: 'heuristiques', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Votre voiture ne demarre pas. Proposez une explication simple et une complexe. Laquelle privilegier ?', inputType: 'text', rubric: 'Simple : batterie decharge. Complexe : defaillance injection + probleme electrique. Occam : verifier la batterie d abord.' } },
    { title: 'Identifiez le sophisme', type: 'TYPE_C', branchSlug: 'logique-raisonnement', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Identifiez le sophisme : Soit vous etes avec nous, soit vous etes contre nous. Vous n avez pas soutenu notre projet, donc vous etes notre ennemi.', inputType: 'text', rubric: 'Fausse dichotomie : l argument presente seulement deux options alors qu il en existe d autres.' } },
    { title: 'Contre-argumentez le biais du survivant', type: 'TYPE_C', branchSlug: 'biais-cognitifs', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Mon grand-pere a fume toute sa vie et a vecu 95 ans, donc fumer n est pas dangereux. Formulez un contre-argument.', inputType: 'text', rubric: 'Biais du survivant : on ne voit que les cas exceptionnels. Les millions de fumeurs morts prematurement sont invisibles.' } },
    { title: 'Utilisez la preuve sociale ethiquement', type: 'TYPE_C', branchSlug: 'persuasion-influence', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Redigez un message marketing qui utilise la preuve sociale de facon ethique pour une application.', inputType: 'text', rubric: 'Bonne reponse : chiffres reels, temoignages authentiques, cas d usage concrets. Pas de superlatifs non verifiables.' } },
    { title: 'Analysez une decision sous biais', type: 'TYPE_C', branchSlug: 'prise-de-decision', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Decrivez une decision recente. Identifiez un biais qui a pu l influencer et comment le contrer.', inputType: 'text', rubric: 'Bonne reponse : biais identifie clairement, influence expliquee, strategie de debiaisage proposee.' } },
    { title: 'Estimation de Fermi', type: 'TYPE_C', branchSlug: 'heuristiques', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Estimez combien de pizzerias il y a dans votre ville en 3 etapes avec l heuristique de Fermi.', inputType: 'text', rubric: 'Decomposer : population / frequence de commande = pizzas/jour / capacite d une pizzeria = nombre de pizzerias.' } },
    { title: 'Construisez un argument persuasif', type: 'TYPE_C', branchSlug: 'persuasion-influence', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Redigez 3 phrases pour convaincre un ami de lire davantage. Utilisez 2 principes de Cialdini.', inputType: 'text', rubric: 'Preuve sociale, reciprocite, autorite. Ex : des etudes montrent que... / je te recommande ce livre qui m a aide.' } },
    { title: 'Le cout irrecuperable', type: 'TYPE_C', branchSlug: 'prise-de-decision', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Vous avez un billet de concert a 80 euros. Vous etes epuise et il pleut. Analysez la decision en ignorant le cout irrecuperable.', inputType: 'text', rubric: 'Ignorer les 80 euros (deja depenses). Se concentrer sur : plaisir attendu vs fatigue et inconfort.' } },
    { title: 'Debiaisez ce raisonnement', type: 'TYPE_C', branchSlug: 'logique-raisonnement', estimatedDuration: 90, content: { type: 'TYPE_C', prompt: 'Identifiez le raisonnement circulaire : La Bible est vraie car c est la parole de Dieu, et on sait que c est la parole de Dieu car la Bible le dit.', inputType: 'text', rubric: 'Raisonnement circulaire : la conclusion est utilisee comme premisse. Il faudrait une source externe independante.' } },
    { title: 'Avez-vous subi le biais de confirmation', type: 'TYPE_D', branchSlug: 'biais-cognitifs', estimatedDuration: 75, content: { type: 'TYPE_D', question: 'Pensez a une croyance forte. Avez-vous deja ignore des informations qui la contredisaient ?', choices: ['Oui, souvent', 'Parfois, sans m en rendre compte', 'Rarement', 'Non, jamais'], anchorFeedback: 'Le biais de confirmation est universel. Chercher activement des preuves contraires s appelle la falsification active.' } },
    { title: 'Quelle heuristique utilisez-vous', type: 'TYPE_D', branchSlug: 'heuristiques', estimatedDuration: 75, content: { type: 'TYPE_D', question: 'Dans vos decisions quotidiennes, quelle heuristique utilisez-vous le plus ?', choices: ['Je fais confiance a mon instinct', 'Je fais ce que font les autres', 'Je me base sur ce dont je me souviens', 'Je pars du premier chiffre entendu'], anchorFeedback: 'Toutes ces heuristiques sont utiles mais peuvent mener a des erreurs. Les reconnaitre permet de choisir quand les utiliser.' } },
    { title: 'Comment prenez-vous vos decisions', type: 'TYPE_D', branchSlug: 'prise-de-decision', estimatedDuration: 75, content: { type: 'TYPE_D', question: 'Face a une decision importante, quelle est votre approche ?', choices: ['Je liste les pour et les contre', 'Je fais confiance a mon intuition', 'Je demande l avis de mon entourage', 'Je reporte jusqu a la derniere minute'], anchorFeedback: 'Combiner analyse rationnelle et intuition donne souvent de meilleurs resultats que l une ou l autre seule.' } },
    { title: 'Etes-vous sensible a la preuve sociale', type: 'TYPE_D', branchSlug: 'persuasion-influence', estimatedDuration: 75, content: { type: 'TYPE_D', question: 'Avez-vous deja change d avis parce que tout le monde le fait ?', choices: ['Oui, regulierement', 'Parfois', 'Rarement', 'Non, jamais'], anchorFeedback: 'La preuve sociale est un mecanisme evolutif. La conscience de ce biais aide a distinguer conformisme utile et manipulation.' } },
    { title: 'Votre rapport au changement', type: 'TYPE_D', branchSlug: 'prise-de-decision', estimatedDuration: 75, content: { type: 'TYPE_D', question: 'Face a un changement benefique mais inconfortable, quelle est votre reaction ?', choices: ['J adopte rapidement', 'J hesite mais je change', 'Je resiste et prefere l habitude', 'Cela depend du contexte'], anchorFeedback: 'Le biais de statu quo est naturel. Reconnaitre cette resistance permet de distinguer vraie raison et inertie cognitive.' } },
  ];

  // Supprimer les anciens swings et recreer proprement
  await db.swingEdge.deleteMany({});
  await db.swingCompletion.deleteMany({});
  await db.swingVote.deleteMany({});
  await db.swing.deleteMany({});

  const swingIds: string[] = [];
  for (const def of swingDefs) {
    const branchId = branches[def.branchSlug];
    if (!branchId) { console.warn('branche introuvable :', def.branchSlug); continue; }
    const swing = await db.swing.create({
      data: {
        type: def.type,
        title: def.title,
        content: def.content,
        estimatedDuration: def.estimatedDuration,
        branchId,
        creatorId: editor.id,
        isPublished: true,
        publishedAt: new Date(),
        qualityScore: 3.5 + Math.random() * 1.5,
        editorialScore: 4.0,
      },
    });
    swingIds.push(swing.id);
  }
  console.log(`${swingIds.length} swings crees`);

  const relationTypes = ['CONCEPT_LIE', 'DIFFICULTE_DIFFERENTE', 'SURPRISE'] as const;
  let edgeCount = 0;
  for (let i = 0; i < swingIds.length; i++) {
    const targets: string[] = [];
    const used = new Set([i]);
    let attempts = 0;
    while (targets.length < 3 && attempts < 100) {
      const r = Math.floor(Math.random() * swingIds.length);
      if (!used.has(r)) { targets.push(swingIds[r]); used.add(r); }
      attempts++;
    }
    for (let j = 0; j < targets.length; j++) {
      try {
        await db.swingEdge.create({
          data: { sourceSwingId: swingIds[i], targetSwingId: targets[j], relationType: relationTypes[j % 3], weight: 0.5 + Math.random() * 0.5 },
        });
        edgeCount++;
      } catch { /* ignore */ }
    }
  }
  console.log(`${edgeCount} aretes creees`);
  console.log('seed termine !');
}

main().catch((e) => { console.error('erreur seed :', e); process.exit(1); }).finally(async () => { await db.$disconnect(); });
