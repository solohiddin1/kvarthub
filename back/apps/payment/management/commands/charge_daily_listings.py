from django.utils import timezone
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction as db_transaction

from apps.shared.utils import get_logger
from apps.listings.models import Listing
from apps.payment.models import Card, Transaction, ListingDailyCharge

logger = get_logger()


class Command(BaseCommand):
    help = 'Charge users daily for their active listings and deactivate listings if insufficient funds'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate the command without making actual changes',
        )
        parser.add_argument(
            '--charge-amount',
            type=float,
            default=None,
            help=f'Amount to charge per listing per day (default: from settings)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        charge_amount = options['charge_amount'] or settings.DAILY_LISTING_CHARGE
        today = timezone.now().date()

        self.stdout.write(self.style.NOTICE(f'Starting daily listing charges for {today}'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No actual charges will be made'))

        # Get all active listings
        active_listings = Listing.objects.filter(is_active=True).select_related('host')
        
        total_listings = active_listings.count()
        successful_charges = 0
        failed_charges = 0
        deactivated_listings = 0

        self.stdout.write(f'Found {total_listings} active listings to charge')

        for listing in active_listings:
            user = listing.host
            
            # Check if already charged today
            already_charged = ListingDailyCharge.objects.filter(
                listing=listing,
                charge_date=today
            ).exists()
            
            if already_charged:
                self.stdout.write(
                    self.style.WARNING(f'Listing {listing.id} already charged today, skipping')
                )
                continue

            # Get user's active card
            user_card = Card.objects.filter(user=user, is_active=True).first()
            
            if not user_card:
                self.stdout.write(
                    self.style.ERROR(f'User {user.email} has no active card. Deactivating listing {listing.id}')
                )
                if not dry_run:
                    listing.is_active = False
                    listing.save()
                    
                    # Record failed charge
                    ListingDailyCharge.objects.create(
                        listing=listing,
                        user=user,
                        amount=charge_amount,
                        charge_date=today,
                        success=False
                    )
                    deactivated_listings += 1
                continue

            # Check if sufficient balance
            if user_card.balance < charge_amount:
                self.stdout.write(
                    self.style.ERROR(
                        f'Insufficient balance for user {user.email} '
                        f'(balance: {user_card.balance}, needed: {charge_amount}). '
                        f'Deactivating listing {listing.id}'
                    )
                )
                if not dry_run:
                    listing.is_active = False
                    listing.save()
                    
                    # Record failed charge
                    ListingDailyCharge.objects.create(
                        listing=listing,
                        user=user,
                        amount=charge_amount,
                        charge_date=today,
                        success=False
                    )
                    deactivated_listings += 1
                    failed_charges += 1
                continue

            # Charge the card
            try:
                if not dry_run:
                    with db_transaction.atomic():
                        # Deduct from card balance
                        balance_before = float(user_card.balance)
                        charged = balance_before - charge_amount
                        user_card.balance = charged

                        user_card.save()
                        
                        # Create transaction record
                        transaction_obj = Transaction.objects.create(
                            user=user,
                            card=user_card,
                            listing=listing,
                            amount=charge_amount,
                            transaction_type='daily_charge',
                            status='completed',
                            description=f'Daily charge for listing: {listing.title}'
                        )
                        
                        # Record daily charge
                        ListingDailyCharge.objects.create(
                            listing=listing,
                            user=user,
                            amount=charge_amount,
                            charge_date=today,
                            transaction=transaction_obj,
                            success=True
                        )
                        
                        successful_charges += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'Charged {charge_amount} from user {user.email} '
                                f'for listing {listing.id}. Remaining balance: {user_card.balance}'
                            )
                        )
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'[DRY RUN] Would charge {charge_amount} from user {user.email} '
                            f'for listing {listing.id}'
                        )
                    )
                    successful_charges += 1
                    
            except Exception as e:
                logger.error(f'Error charging user {user.email} for listing {listing.id}: {str(e)}')
                self.stdout.write(
                    self.style.ERROR(f'Error charging listing {listing.id}: {str(e)}')
                )
                failed_charges += 1

        # Summary
        self.stdout.write(self.style.NOTICE('\n' + '='*50))
        self.stdout.write(self.style.NOTICE('DAILY CHARGE SUMMARY'))
        self.stdout.write(self.style.NOTICE('='*50))
        self.stdout.write(f'Total active listings: {total_listings}')
        self.stdout.write(self.style.SUCCESS(f'Successful charges: {successful_charges}'))
        self.stdout.write(self.style.ERROR(f'Failed charges: {failed_charges}'))
        self.stdout.write(self.style.WARNING(f'Deactivated listings: {deactivated_listings}'))
        self.stdout.write(self.style.NOTICE('='*50))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nThis was a DRY RUN - no actual changes were made'))
