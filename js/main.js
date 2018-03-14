$( document ).ready(function() {

	initTask1();
	initTask2();

	$( 'i.fa-chevron-down' ).click((o) => {
		$( 'i.fas' ).hide();

		$( '#task1-wrapper' ).slideUp(() => { $( 'i.fas' ).show(); });
		$( '#task2-wrapper' ).show();
	});
	$( 'i.fa-chevron-up' ).click((o) => {
		$( 'i.fas' ).hide();

		$( '#task2-wrapper' ).hide();
		$( '#task1-wrapper' ).slideDown(() => { $( 'i.fas' ).show(); });
	});
});
