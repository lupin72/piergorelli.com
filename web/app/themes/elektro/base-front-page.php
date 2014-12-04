<?php get_template_part('templates/head'); ?>
<body <?php body_class(); ?>>
	<div id="viewport">
		<div id="container">
			<div id="cube">
  <!--[if lt IE 8]>
    <div class="alert alert-warning">
      <?php _e('You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.', 'roots'); ?>
    </div>
  <![endif]-->

  <?php
    do_action('get_header');
    get_template_part('templates/header');
  ?>

  <div class="wrap container" role="document">
    <div class="content row">
      <main class="main" role="main">
        <?php include roots_template_path(); ?>
      </main><!-- /.main -->
    </div><!-- /.content -->
  </div><!-- /.wrap -->
  <?php
  $args = array(
	  'cat'				=> 3,
	  'posts_per_page'	=> 4
  );
  $works = new WP_Query($args);
  if($works->have_posts()):
  ?>
  <div class="portfolio">
	<?php
	while($works->have_posts()) :
		$works->the_post();
		//print_r($post);
	?>  
	<a class="trigger" href="/our-work/skydive-jurien-bay/">
		<div class="feature one">
			<div class="face cover">
				<figure class="effect-ming">
				<?php
				if(has_post_thumbnail()):
					the_post_thumbnail('home-work');
				endif;	
				?>
				<figcaption>
					<h2><?php the_title();?></h2>
					<p>this is a <strong>test</strong></p>
				</figcaption>	
			</figure>
			</div>
		</div>
	</a>
	<?php
	endwhile;	
	wp_reset_query();
	wp_reset_postdata();
	?>
  </div>
<?php
endif;
?>  
  			</div><!-- /cube -->
  		</div><!-- /container -->
	</div><!-- /viewport -->
  <?php get_template_part('templates/footer'); ?>

  <?php wp_footer(); ?>

</body>
</html>
